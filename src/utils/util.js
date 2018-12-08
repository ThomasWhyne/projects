const _throttle=(fn,wait)=>{
    let timer,source, previous=0;
    const later=()=>{
        previous=+new Date();
        timer=null;
        fn(source);
    }
    const throttled=(evt)=>{
        let now=+new Date();
        let remain=wait-(now-previous);
        source=evt;
        if(remain<=0 || remain>wait){
            if(timer){
                clearTimeout(timer);
                timer=null;
            }
            previous=now;
            fn(source);
        }else if(!timer){
            timer=setTimeout(later,remain);
        }
    }
    return throttled;
}

// const _debounce=(fn,wait)=>{
//     let timer;
//     return (evt)=>{
//         clearTimeout(timer);
//         timer=setTimeout(()=>{
//             fn(evt);
//         },wait)
//     }
// }
const _formate=({time}={})=>{
    let now = +new Date();
    let difference = (now - time) / 10000;
    let stamp = "";
    let { floor, ceil } = Math;
    return (difference <= 0 || floor(difference / 60) <= 0)
        ? "刚刚"
        : difference < 3600
            ? `${floor(difference / 60)}分钟前`
            : difference >= 3600 && difference <= 86400
                ? `${floor(difference)}小时前`
                : difference / 86400 <= 1
                    ? "昨天"
                    : difference / 86400 <= 31 && difference / 86400 > 1
                        ? `${ceil(difference)}天前`
                        : difference / 86400 >= 31
                            ? new Date(time).toLocaleString()
                            : "在很久很久以前"
}

export {
    _throttle,
    _formate
}