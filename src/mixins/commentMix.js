import wepy from "wepy";
import { _articleRetrive, _commentRetrive, _updateLiked, Commentator } from "@/utils/cloudAsync";
import { _queryViews, _insertViews } from "@/utils/storage";
import { _throttle } from "@/utils/util";
const fnArray = ["setUserFavors", "setUserLiked"];
const cloud = wx.cloud.callFunction;
export default class CommentMix extends wepy.mixin{
    events={
        "likeToggled": ({ index, comment_id, isLiked } = {}) => {
            let data = {
                comment_id,
                uuid: this.page.user_id
            };
            if (!isLiked) {
                this.page.comment_list[index].favour_num++;
                data.inc_num = 1;
            } else {
                this.page.comment_list[index].favour_num--;
                data.inc_num = -1;
            }
            this.page.comment_list[index].isLiked = !isLiked;
            this.bufferLiked(data);
            this.page.$nextTick(()=>{
                getCurrentPages().map(page =>{
                    if (page.route == "pages/detail"){
                        page.data.comment_list=this.page.comment_list;
                    }
                });
            })
        },
        "postPrepared":(prepared)=>{
            const data={
                ...prepared,
                article: this.page.article_id,
                uuid:this.page.user_id,
            }
            console.log(data);
            wx.showLoading({
                title:"发布中..."
            })
            new Commentator(data).created((comment)=>{
                wx.hideLoading();
                this.page.newComments.unshift(comment);
                this.page.$apply();
                this.page.$broadcast("clearInput");
                console.log(comment);
            });
            
        },
        "showReplyMenu":(replyTo)=>{
            const itemList=[`回复：${replyTo.to}`,"复制","举报"];
            wx.showActionSheet({
                itemList,
                itemColor:"#889191",
                success:res=>{
                    res.tapIndex===0&&this.page.$broadcast("triggerInput",replyTo);
                }
            })
        }
    }
    bufferLiked(data) {
        let index = this.page.bufferArray.findIndex(buffer => buffer.comment_id == data.comment_id);
        if (index < 0) {
            this.page.bufferArray.push(data);
        } else {
            this.page.bufferArray.splice(index, 1);
        }
        console.log(this.page.bufferArray);
    }
    // mixins share exact lifetimes with the page mounted
    //as for those none lifetimes 
    onHide(){
        console.log(`${this.$root} calling onhide`)
    }
    onUnload() {
        console.log("calling _updateLiked");
        this.bufferArray.length&&_updateLiked(fnArray, this.bufferArray);
    }
    onReady() {
    }
}