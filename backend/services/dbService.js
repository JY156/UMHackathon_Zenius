const logService = require('./logService');
const loadService = require('./loadService');
const storageService = require('./storageService');
const inputService = require('./inputService');
const userService = require('./userService');
const taskService = require('./taskService');
const approvalService = require('./approvalService');

module.exports = {
    ...logService,
    ...loadService,
    ...storageService,
    ...inputService,
    ...userService,
    ...taskService,
    ...approvalService
};