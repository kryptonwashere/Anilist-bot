'use strict';

import mongoose from 'mongoose';

// Supress console warnings
mongoose.Promise = global.Promise;

/***********************************************************************************************************************
****************************************************** ANILIST *********************************************************
***********************************************************************************************************************/

// Unfortunatelly  nani  doesn't  allow  yet PIN authentication -- once allows it this Schema will be already available.

// Will  fetch  all user data from Anilist if the user choose to. Syncing all data so he can us Anilist throught the bot
// -- adding and removing animes from it.
const anilistSchema = mongoose.Schema({
    // Just to know that Anilist will be derivated -- if exists -- from Telegram's User.
    _creator: {
        type: Number,
        ref: 'User'
    },
    access_token: String,
    token_type: String,
    expires: Number,
    expires_in: Number
});
const Anilist = mongoose.model('Anilist', anilistSchema);

/***********************************************************************************************************************
******************************************************** USER **********************************************************
***********************************************************************************************************************/

const userSchema = mongoose.Schema({
    // Mongoose's User id will be the same as Telegram's User id.
    _id: Number,
    // Notifications  is unique for each anime, even if isn't airing beacause this anime could be only in hiatus, coming
    // back later.
    // In this case the notification is for all or none anime.
    notify: {
        type: Boolean,
        default: true
    },
    // Set  time  so  that  way  the user can recive all daily notifications when it's most intresting to his uses -- by 
    // deafault he will only be updated about new episodes when the time is airing.
    time: {
        type: Date,
        default: undefined
    },
    // Anilist's User.
    anilist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anilist',
        default: undefined
    },
    // When  the user want to see an anime that he's hasn't seen yet this will show options. Only creates it if the user
    // wants it to use it -- no need to create and store it if the user doesn't use it.
    recomendations: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recommended',
        default: undefined
    }
});
const User = mongoose.model('User', userSchema);

/***********************************************************************************************************************
***************************************************** SUBSCRIBE ********************************************************
***********************************************************************************************************************/

// This subscrption schema will have to check it out if User set a time for updates when runs it.
const subscriptionSchema = mongoose.Schema({
    // This to see what kind of content -- true: anime, false: manga
    type: {
        type: Boolean,
        ref: 'Anime or Manga'
    },
    // This is an individual anime notification
    notify: {
        type: Boolean,
        default: true
    },
    user: {
        type: Number,
        ref: 'User'
    },
    content: {
        type: Number,
        ref: 'Anime or Manga'
    }
});
const Subscription = mongoose.model('Subscription', subscriptionSchema);

/***********************************************************************************************************************
************************************************** NOTIFICATIONS *******************************************************
***********************************************************************************************************************/

// This will be so that the bot can add anime/mangas to notify user upon new episodes/chapters/volumes releases.
const notifySchema = mongoose.Schema({
    // Since  Anilist  API  provides the countdown to new releases, the bot just need to fetch it. No need to care about
    // date.
    _id: {
        type: Number,
        ref: 'Anime or Manga'
    },
    // This to see what kind of content -- true: anime, false: manga
    type: {
        type: Boolean,
        ref: 'Anime or Manga'
    },
    time: {
        type: Date,
        ref: 'Next realease'
    }
});
const Notifications = mongoose.model('Notifications', notifySchema);

// This schema will have only hava subscriptions from users that wanted to recive notifications at given time.
const notifyUserSchema = mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    }]
});
const notifyUser = mongoose.model('notifyUser', notifyUserSchema);

/***********************************************************************************************************************
**************************************************** RECOMMENDED *******************************************************
***********************************************************************************************************************/

// When user wants to see an anime that he haven't see yet this will show recomendadions given his watchlist

// "Why implement a Anime instead of using an array of Numbers containing the content id of Anilist database???..."
//
// "...So  when  this  content it's removed from Anilist databse the bot database would have to search it for each entry
// that  had  its  number  to  remove  it  from  bot's database. Referencing it looks like more troublesome, but has its 
// advantages  --  if  a  user  searches  for  its content and the Anilist database says it that doesn't have it anymore 
// automatically the bot updates its database to have that info reference it to all derivated as well."
const typeSchema = mongoose.Schema({
    _creator: {
        type: Number,
        ref: 'Recommended'
    },
    tv: [{
        type: Number,
        ref: 'Anime'
    }],
    movie: [{
        type: Number,
        ref: 'Anime'
    }],
    special: [{
        type: Number,
        ref: 'Anime'
    }],
    ova: [{
        type: Number,
        ref: 'Anime'
    }],
    ona: [{
        type: Number,
        ref: 'Anime'
    }],
    tv_short: [{
        type: Number,
        ref: 'Anime'
    }]
});
const Type = mongoose.model('Type', typeSchema);

const statusSchema = mongoose.Schema({
    _creator: {
        type: Number,
        ref: 'Recommended'
    },
    animes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    }]
});
const Status = mongoose.model('Status', statusSchema);

// An  entity  to  reference  Anilist's Genres it's good so that way if an Genres it's removed from Anilist and one user
// queries it, when he find's about it all useres recommend genre database is update it about it.
const referenceGenresSchema = mongoose.Schema({
    _id: Number,
    referenced: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genres'
    }]
});
const referenceGenres = mongoose.model('referenceGenres', referenceGenresSchema);

const genresSchema = mongoose.Schema({
    // Mongoose'genres id will be the same as Recommended id.
    _creator: {
        type: Number,
        ref: 'Recommended'
    },
    // But at the same time it will have bot's Genres id so this way can fetch it more info about it in Anilist.
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'referenceGenres'
    },
    animes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    }],
});
const Genres = mongoose.model('Genres', genresSchema);

// Didn't implemented airing because status already have it.
// 
// "Why not reference Type, Status and Genres here as well since they are statically to Anilist database?..."
// 
// "...This  might be true in Anilist dabase, but each bot's User will have a unique set of this kind of recommedations;
// so that way the Genres recommend Animes for the User 'Spock' will not necessarly be the same to 'Kirk' User.".
const recommendedSchema = mongoose.Schema({
    _creator: {
        type: Number,
        ref: 'User'
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Type'
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Status'
    },
    // No need to worry about same primary key in Genres since it's a combination with revenreceGenres
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genres'
    }]
});
const Recommended = mongoose.model('Recommended', recommendedSchema);

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    mongoose,
    User,
    Subscription,
    Notifications,
    notifyUser
}
