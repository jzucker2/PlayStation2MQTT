const {setPlaystationWake, setPlaystationStandby, getPlaystationInfo} = require("./playstation");
const {HassSwitch} = require("./hassSensors");

const handleGetPlaystationInfoRequest = async (req, res) => {
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.debug(`server info starting with ip: ${ps5_ip}`);

    try {
        const results = await getPlaystationInfo(ps5_ip);
        console.debug(`server info got results ===> ${results}`);
        return res.json(results);
    } catch (e) {
        console.error(`server info returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
}

const handleWakePlaystationRequest = async (req, res) => {
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.debug(`server wake starting with ip: ${ps5_ip}`);

    try {
        const results = await setPlaystationWake(ps5_ip);
        console.debug(`server wake got results ===> ${results}`);
        return res.json({
            'message': 'ps5 awakened'
        });
    } catch (e) {
        console.error(`server wake returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
}

const handleStandbyPlaystationRequest = async (req, res) => {
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    console.debug(`server standby starting with ip: ${ps5_ip}`);

    try {
        const results = await setPlaystationStandby(ps5_ip);
        console.debug(`server standby got results ===> ${results}`);
        return res.json({
            'message': 'ps5 asleep'
        });
    } catch (e) {
        console.error(`server standby returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
}

exports.handleGetPlaystationInfoRequest = handleGetPlaystationInfoRequest;
exports.handleWakePlaystationRequest = handleWakePlaystationRequest;
exports.handleStandbyPlaystationRequest = handleStandbyPlaystationRequest;
