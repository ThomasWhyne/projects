// const cloud = wx.cloud.callFunction;
// const buffer=[];
// class cloudAsync {
//     static userFavors({uuid,doc_id,status}={}){
//         if (!uuid || !doc_id || !status) throw new Error("params => userFavors");
//         let name ="setUserFavors";
//         let data={ uuid,doc_id,status };
//         return cloud({ name, data });
//     }
// }

// const cloudAll=(buffer)=>{
//     return Promise.all(buffer).then(res=>res).catch(err=>err);
// }

// const cloudUpdate=(fnArray=[],argSet={})=>{
//     let buffer=fnArray.map(fn=>(cloudAsync[fn](argSet))) 
//     cloudAll(buffer);
    
// }
// this.article_id = { "doc_id": options.id };
// let { data } = await article_list.where(this.article_id).get();
// this.article = data[0];
// this.$apply();
// console.log(this.article);
// this.favors = this.article.favored;
// this.unfavors = this.article.unfavored;
// const uuid = this.$parent.globalData.uuid;
// this.uuid = uuid;
// console.log(this.uuid);
// this.$apply();
import { _formate } from "@/utils/util";
const cloud = wx.cloud.callFunction;
const db = wx.cloud.database();
const articles = db.collection('article_list');
const comments = db.collection("comment_list");
const users = db.collection("user_list");
const _articleRetrive = async ({ article_id,user_id,history }={},callback)=>{
    let [ article ]= await articles.where({doc_id: article_id}).get().then(res=>res.data);
    if(!history){
        history = await users
            .where({ uuid: user_id })
            .field({ favored: true, unfavored: true })
            .get()
            .then(res => {
                 let { favored,unfavored }=res.data[0];
                return {
                    status:favored.includes(article_id)?1:unfavored.includes(article_id)?2:0,
                    offset:0
                }
            });
    }
    await callback({article,history});
}
const _justyfyLike = (comment_id, userlikes) => userlikes.includes(comment_id);

const _commentRetrive = async ({ article_id, user_id}={},callback)=>{
    let { data:[ { liked } ] }= await users.where({uuid:user_id}).field({liked:true}).get();
    let { data }=await comments.where({article_id}).get();
    let comment_list=data.map(com=>{
        com.timestamp = _formate({ time: com.timestamp});
        com.isLiked = _justyfyLike(com.comment_id, liked);
        return com;
    })
    callback({comments:comment_list})
}

const _updateLiked=([,name]=[],bufferArray)=>bufferArray.map(async data=>await cloud({name,data}));

export {
    _articleRetrive,
    _commentRetrive,
    _updateLiked
}