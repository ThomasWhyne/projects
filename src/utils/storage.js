const _queryViews=(doc_id)=>{
    const views = wx.getStorageSync('views');
    if(!doc_id)return views;
    let [view] = views.filter(view => view.doc_id == doc_id);
    return view;
}

const _insertViews=(view)=>{
    if (!view) return;
    let key="views";
    wx.getStorage({
        key,
        success:res=>{
            let data=res.data.filter(v=>v.doc_id!==view.doc_id);
            data.push(view)>3?data.shift():void 0;
            wx.setStorage({key,data})
        }
    })
}

export {
    _queryViews,
    _insertViews
}