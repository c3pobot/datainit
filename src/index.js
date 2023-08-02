'use strict'
const log = require('logger')
const path = require('path')
const fs = require('fs')
const s3client = require('s3client')
const S3_BUCKET = process.env.S3_DATA_BUCKET || 'gamedata'
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')

const saveFile = async(fileName, fileData)=>{
  try{
    await fs.writeFileSync(path.join(DATA_PATH, fileName), JSON.stringify(fileData))
  }catch(e){
    throw(e)
  }
}
const checkFileExists = async(fileName)=>{
  try{
    let status = await fs.readFileSync(path.join(DATA_PATH, fileName))
    if(status) return true
  }catch(e){
    //log.debug(fileName+' does not exist')
  }
}
const downloadFiles = async()=>{
  try{
    let versions = await s3client.get(S3_BUCKET, 'versions.json')
    if(versions?.gameVersion && versions?.localeVersion){
      log.info('Downloading files for '+versions.gameVersion+'...')
      for(let i in versions){
        if(versions[i] !== versions.localeVersion && i !== 'gameVersion' && i !== 'assetVersion'){
          let status = await checkFileExists(i)
          if(status) continue;
          let fileData = await s3client.get(S3_BUCKET, i)
          if(fileData){
            await saveFile(i, fileData)
          }else{
            throw('Error getting '+i)
          }
        }
      }
      let localeFile = await s3client.get(S3_BUCKET, 'Loc_ENG_US.txt.json')
      if(localeFile){
        await saveFile('Loc_ENG_US.txt.json', localeFile)
      }else{
        throw('Error getting Loc_ENG_US.txt.json')
      }
      let localeKeyMap = await s3client.get(S3_BUCKET, 'Loc_Key_Mapping.txt.json')
      if(localeKeyMap){
        await saveFile('Loc_Key_Mapping.txt.json', localeKeyMap)
      }else{
        throw('Error getting Loc_Key_Mapping.txt.json')
      }
      log.info('Downloaded all files from object storage..')
    }else{
      throw('error getting version.json from object storage...')
    }
  }catch(e){
    log.error(e)
    setTimeout(downloadFiles, 5000)
  }
}
downloadFiles()
