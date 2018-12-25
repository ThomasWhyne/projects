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
import { _formate, _createRandom } from "@/utils/util";
const cloud = wx.cloud.callFunction;
const db = wx.cloud.database();
const _ = db.command;
const articles = db.collection('article_list');
const comments = db.collection("comment_list");
const users = db.collection("user_list");

const _cloudLog=async (code,callback)=>{
    const { result: userData }=await cloud({
        name:"login",
        data:{code}
    });
   callback(userData);
}

const _articleRetrive = async ({ article_id,user_id,history }={},callback)=>{
    console.log(user_id);
    let [ article ]= await articles.where({doc_id: article_id}).get().then(res=>res.data);
    if(!history){
        history = await users
            .where({ uuid: user_id })
            .field({ favored: true, unfavored: true })
            .get()
            .then(res => {
                console.log(res.data)
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

const _commentRetrive = async ({ article_id, comment_id, user_id, depth=0, orderKey ="favour_num",sequence="desc",limit=3}={},callback)=>{
    console.log(article_id,user_id);
    let { data:[ { liked } ] }= await users.where({uuid:user_id}).field({liked:true}).get();
    let { data } = article_id ? 
        await comments.where({ article_id, depth }).orderBy(orderKey, sequence).limit(limit).get() : 
        await comments.where({path:comment_id,depth:1}).orderBy(orderKey, sequence).get();
    let comment_list=data.map(com=>{
        com.timestamp = _formate(com.timestamp);
        com.isLiked = _justyfyLike(com.comment_id, liked);
        return com;
    })
    callback({comments:comment_list})
}

const _updateLiked=([,name]=[],bufferArray)=>bufferArray.map(async data=>await cloud({name,data}));



const _addNewSticker=(callback)=>{
    wx.chooseImage({
        count: 4,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
            const tempfilepaths = res.tempFilePaths;
            console.log();
            callback(tempfilepaths);
            for (let i in tempfilepaths) {
                let randomstring = Math.floor(Math.random() * 1000000) + '.png';
                wx.cloud.uploadFile({
                    cloudPath: randomstring,
                    filePath: tempfilepaths[i],
                    success: res => {
                        console.log(res);
                        users.where({ uuid: "0dee5f35-1959-48df-a868-da18d9d6be5c"}).update({
                            data:{
                                sticker: _.push(res.fileID)
                            }
                        }).then(res => {
                            wx.showToast({
                                title: '上传成功',
                                icon: 'success'
                            })
                        })
                    },
                    fail: err => {
                        wx.showToast({
                            title: '上传失败',
                            icon: 'fail'
                        })
                    }
                });
            }
        },
    })
}

class Commentator {
    constructor({ article, uuid, content, depth, userData, parent, path, to, sticker}) {
        this.article_id = article;
        this.content = content;
        this.comment_uuid = uuid;
        this.comment_id = _createRandom();
        this.depth = depth || 0;
        this.favour_num = 0;
        this.favor_users = [];
        this.favour_num = 0;
        this.first_reply = {};
        this.game_data = userData || this.retriveUserData(uuid);
        this.parent_uuid = parent || null;
        this.path = path || null;
        this.reply_to = to || null;
        this.sticker_src = sticker;
        // this.thread_id = thread;
        this.timestamp = +new Date();
        this.total_reply = 0;
    }
    created(callback) {
        if (!this.checked()) throw new Error("Exceptions creating comment");
        const data = JSON.parse(JSON.stringify(this));
        try{
            cloud({ name: "addNewComment", data }).then(res=>{
                data.timestamp = _formate(data.timestamp);
                data.isLiked = _justyfyLike(data.comment_id, []);
                callback(data);
            })
        }catch(err){
            throw err;
        }
    }
    checked() {
        return !!this.article_id && !!this.comment_uuid && !!this.comment_id;
    }
}



export {
    _cloudLog,
    _articleRetrive,
    _commentRetrive,
    _updateLiked,
    _addNewSticker,
    Commentator
}