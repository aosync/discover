const Eris = require('eris');

const Events = require('./Events');

module.exports = class Discover extends Eris {
    constructor(context, options) {
        super(context.token, options);
        this.target = context.channelId;
        Events(this);
    }
};
