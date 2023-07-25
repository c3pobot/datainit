'use strict'
const path = require('path')
const log = require('logger')
const fetch = require('node-fetch')
const S3_API_URI = process.env.S3_API_URI
const S3_BUCKET = process.env.S3_DATA_BUCKET || 'gamedata'
const parseResponse = async(res)=>{
  try{
    if(res?.status?.toString().startsWith(4)) throw('Fetch Error')
    if(!res?.status?.toString().startsWith('2')) return
    if(res.headers?.get('Content-Type')?.includes('application/json')) return await res.json()
  }catch(e){
    throw(e)
  }
}
module.exports = async(file)=>{
  try{
    if(!file || !S3_API_URI) return
    let payload = { method: 'GET', compress: true, timeout: 60000 }
    let res = await fetch(path.join(S3_API_URI, 'get?Bucket='+S3_BUCKET+'&Key='+file), payload)
    return await parseResponse(res)
  }catch(e){
    log.info('error getting '+file)
    throw(e);
  }
}
