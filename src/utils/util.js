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
var getLastDate = function (time) {
    var date = getDate(time)
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    var day = date.getDay() < 10 ? '0' + (date.getDay()) : date.getDay()
    return date.getFullYear() + '-' + month + '-' + day
}
const _formate=(time)=>{
    let now = +new Date();
    let difference =(now - time) / 1000;
    let stamp = "";
    if (time <= 0) {
        stamp = '刚刚'
    } else if (Math.floor(difference / 60) <= 0) {
        stamp = '刚刚'
    } else if (difference < 3600) {
        stamp = Math.floor(difference / 60) + '分钟前'
    } else if (difference >= 3600 && (time - now >= 0)) {
        stamp = Math.floor(difference / 3600) + '小时前'
    } else if (difference / 86400 <= 31) {
        stamp = Math.ceil(difference / 86400) + '天前'
    } else {
        stamp = getLastDate(time);
    }
    return stamp;
}

const _createRandom = () => {
    const strings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const { max: Max, min: Min, random: Ran, ceil: Ceil, floor: Floor } = Math;
    const len = strings.length;
    const start = Floor(Ran() * len);
    const end = start >= len - 9 ? start - 9 : start + 9;
    return Array
        .from(strings)
        .slice(Min(start, end), Max(start, end))
        .map((str, idx, arr) => `${str}${strings[Floor(Ran() * len)]}`)
        .join("");
}
export {
    _throttle,
    _formate,
    _createRandom
}