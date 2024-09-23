'use strict';

const { logger } = require("./logging");
const {setPlaystationWake, setPlaystationStandby, getPlaystationInfo} = require("./playstation");

const handleGetPlaystationInfoRequest = async (req, res) => {
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    logger.debug(`server info starting with ip: ${ps5_ip}`);

    try {
        const results = await getPlaystationInfo(ps5_ip);
        logger.debug(`server info got results ===> ${results}`);
        return res.json(results.getInfoDict());
    } catch (e) {
        logger.error(`server info returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
}

const handleWakePlaystationRequest = async (req, res) => {
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    logger.debug(`server wake starting with ip: ${ps5_ip}`);

    try {
        const results = await setPlaystationWake(ps5_ip);
        logger.debug(`server wake got results ===> ${results}`);
        return res.json({
            'message': 'ps5 awakened'
        });
    } catch (e) {
        logger.error(`server wake returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
}

const handleStandbyPlaystationRequest = async (req, res) => {
    // https://zellwk.com/blog/async-await-express/
    const { ps5_ip } = req.params;
    logger.debug(`server standby starting with ip: ${ps5_ip}`);

    try {
        const results = await setPlaystationStandby(ps5_ip);
        logger.debug(`server standby got results ===> ${results}`);
        return res.json({
            'message': 'ps5 asleep'
        });
    } catch (e) {
        logger.error(`server standby returning error --> ${e.toString()}`);
        return res.status(404).json({
            'message': e.toString()
        });
    }
}

exports.handleGetPlaystationInfoRequest = handleGetPlaystationInfoRequest;
exports.handleWakePlaystationRequest = handleWakePlaystationRequest;
exports.handleStandbyPlaystationRequest = handleStandbyPlaystationRequest;
