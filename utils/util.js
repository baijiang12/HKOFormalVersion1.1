function getDateDiff(dateTimeStamp) {
    var result;
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    if (diffValue < 0) {
        return;
    }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    if (monthC >= 1) {
        if (monthC <= 12)
            result = "" + parseInt(monthC) + "月前";
        else {
            result = "" + parseInt(monthC / 12) + "年前";
        }
    }
    else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    }
    else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    }
    else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前";
    }
    else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else {
        result = "刚刚";
    }

    return result;
};
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}
function formatTime(number, format) {

    var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
    var returnArr = [];

    var date = new Date(number);
    returnArr.push(date.getFullYear());
    returnArr.push(formatNumber(date.getMonth() + 1));
    returnArr.push(formatNumber(date.getDate()));

    returnArr.push(formatNumber(date.getHours()));
    returnArr.push(formatNumber(date.getMinutes()));
    returnArr.push(formatNumber(date.getSeconds()));

    for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
}
function getDays(date) {
    // 构造1月1日
    var lastDay = new Date(date);
    lastDay.setMonth(0);
    lastDay.setDate(1);

    // 获取距离1月1日过去多少天
    var days = (date - lastDay) / (1000 * 60 * 60 * 24) + 1;
    return days;
}
module.exports = {
    getDateDiff: getDateDiff,
    formatTime: formatTime,
    getDays:getDays
}