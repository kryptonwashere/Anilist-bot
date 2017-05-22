'use strict';

import dotenv from 'dotenv';
import Telegraf from 'telegraf';
import nani from 'nani';
import {
    welcome,
    help,
    defaultResponse,
    messageSearch,
    search,
    notFound,
    logo_al,
    empty,
    watchMessage,
    removeCmd,
    messageToString,
    verifyData,
    verifyNumber,
    verifyString,
    verifyStringNumber,
    verifyName,
    verifyTitle,
    verifyJPTitle,
    verifyENTitle,
    verifyObject,
    verifyButton,
    verifyMD,
    verifyYT,
    verifyWS,
    verifyDate,
    verifyAdult,
    verifyNumbers
} from './utils';

dotenv.config();
nani.init(process.env.NANI_ID, process.env.NANI_TOKEN);

/***********************************************************************************************************************
 *********************************************** REPLY FUNCTIONS *******************************************************
 **********************************************************************************************************************/

/**
 * When  the  text  sent  to  a  button  is  too long, Telegram limits it to 200
 * characters, so there's a need to clean this up and make it more readble.
 * @param {string} string - String to be shortened.
 * @returns {string} Shortned version of string.
 */
const replyCallback = string => ('Not available' != string ) ? `${messageToString(string).substring(0, string.lastIndexOf(' '))}...` : 'Not available';

/**
 * Set the data as button box message to info related about users.
 * @param {json} status - All the data about users.
 * @returns {string} Message to be printed.
 */
const replyUsers = status => {
    const completed = verifyButton('Completed', status.completed);
    const on_hold = verifyButton('On hold', status.on_hold);
    const dropped = verifyButton('Dropped', status.dropped);
    const to_watch = verifyButton('Plan to watch', status.plan_to_watch);
    const watching = verifyButton('Watching', status.watching);

    return `${completed}${on_hold}${dropped}${to_watch}${watching}`;
}

/**
 * Set the data as button box message to info related about the media.
 * @param {json} data - All the data about the media.
 * @returns {string} Message to be printed.
 */
const replyStatus = data => {
    const status = verifyButton('Status', data.airing_status);
    const episodes = verifyButton('Episodes', data.total_episodes);
    const popularity = verifyButton('Popularity', data.popularity);
    const start = verifyDate('Start date', data.start_date);
    const end = verifyDate('End date', data.end_date);

    return `${status}${episodes}${popularity}${start}${end}`;
}

/**
 * This function allow the buttons search for the given id data.
 * @param {string} id - Anilist id.
 * @param {string} type - Type of the content.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const replyButton = (id, type) => {
    let data;

    switch(type) {
        case 'anime':
            data = Telegraf.Extra
                           .markdown()
                           .markup((m) =>
                               m.inlineKeyboard([
                                   m.callbackButton('Description', `${id}/${type}/description`),
                                   m.callbackButton('Genres', `${id}/${type}/genres`),
                                   m.callbackButton('Users', `${id}/${type}/users`),
                                   m.callbackButton('Watchlist', `${id}/${type}/watchlist`)
                               ])
                           ).reply_markup;
            break;
        case 'character':
            data = Telegraf.Extra
                           .markdown()
                           .markup((m) =>
                               m.inlineKeyboard([
                                   m.callbackButton('Description', `${id}/${type}/description`)
                               ])
                           ).reply_markup;
            break;
        case 'staff':
            data = Telegraf.Extra
                           .markdown()
                           .markup((m) =>
                               m.inlineKeyboard([
                                   m.callbackButton('Description', `${id}/${type}/description`)
                               ])
                           ).reply_markup;
            break;
        default:
            data = undefined;
    }

    return data;
}

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyAnime = data => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const youtube = verifyYT(data.youtube_id);
    const adult = verifyAdult(data.adult);
    const type = verifyMD(data.type, data.series_type);
    const score = verifyMD('Score', data.average_score);
    const status = verifyMD('Status', data.airing_status);
    const episodes = verifyMD('Episodes', data.total_episodes);
    const popularity = verifyMD('Popularity', data.popularity);
    const start = verifyDate('Start date', data.start_date);
    const end = verifyDate('End date', data.end_date);

    /*  \u200B is the invisible emoji   */
    return `[\u200B](${data.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}${episodes}${popularity}${start}${end}`;
}

/**
 * Set the character data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyCharacter = data => {
    const firstName = verifyName(data.name_first);
    const lastName = verifyName(data.name_last);
    const japanese = verifyJPTitle(data.name_japanese);
    const english = verifyENTitle(`${firstName} ${lastName}`);

    return `[\u200B](${data.image_url_lge})${japanese}${english}`;
}

/**
 * Set the staff data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyStaff = data => {
    const japaneseFirst = verifyName(data.name_first_japanese);
    const japaneseLast = verifyName(data.name_last_japanese);
    const englishFirst = verifyName(data.name_first);
    const englishLast = verifyName(data.name_last);
    const japanese = verifyJPTitle(`${japaneseFirst} ${japaneseLast}`);
    const english = verifyENTitle(`${englishFirst} ${englishLast}`);
    const language = verifyMD('Language', data.language);
    const website = verifyWS(data.website);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${language}${website}`;
}

/**
 * Set the studio data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyStudio = data => {
    const name = verifyTitle(data.studio_name);
    const website = verifyWS(data.studio_wiki);

    return `[\u200B](${logo_al})${name}${website}`;
}

/**
 * Set Anilist data converted to inline response on Telegram.
 * @param {string} type - What kind of content data represents
 * @param {json} data - Anilist data
 * @returns {json} Anilist data set in Telegram standards.
 */
const replyInline = (type, data) => {
    let dataId, dataTitle, messageText, buttonsMarkup, dataDescription, thumbUrl;

    switch(type) {
        case 'anime':
            dataId = `${data.id}`;
            dataTitle = data.title_english;
            messageText = replyAnime(data);
            buttonsMarkup = replyButton(data.id, 'anime');
            dataDescription = verifyString(data.description);
            thumbUrl = data.image_url_med;
            break;
        case 'character':
            dataId = `${data.id}`;
            dataTitle = data.name_first;
            messageText = replyCharacter(data);
            buttonsMarkup = replyButton(data.id, 'character');
            dataDescription = verifyString(data.info);
            thumbUrl = data.image_url_lge;
            break;
        case 'staff':
            dataId = `${data.id}`;
            dataTitle = data.name_first;
            messageText = replyStaff(data);
            buttonsMarkup = replyButton(data.id, 'staff');
            dataDescription = verifyString(data.info);
            thumbUrl = data.image_url_lge;
            break;
        case 'studio':
            dataId = `${data.id}`;
            dataTitle = data.studio_name;
            messageText = replyStudio(data);
            buttonsMarkup = undefined;
            dataDescription = 'Not available';
            thumbUrl = logo_al;
            break
    }

    return {
        id: dataId,
        title: dataTitle,
        type: 'article',
        input_message_content: {
            message_text: messageText,
            parse_mode: 'Markdown',
        },
        reply_markup: buttonsMarkup,
        description: dataDescription,
        thumb_url: thumbUrl
    };
}

/**
 * Put in a preview layout about the user watchlist data
 * @param {Number} index - postion of anime in watchlist
 * @param {Number} id - anime id
 * @returns watchlist preview info
 */
const replyWatchlist = (index, id) => {
    return nani.get(`anime/${id}`)
               .then(data =>{
                    const japanese = verifyJPTitle(data.title_japanese);
                    const english = verifyENTitle(data.title_english);
                    const youtube = verifyYT(data.youtube_id);
                    const adult = verifyAdult(data.adult);
                    const line = '————————'

                    return `${line}\t${index}\t${line}\n${japanese}${english}${youtube}${adult}`;
               });
}

/***********************************************************************************************************************
 *********************************************** SEARCH FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * Search for anime and returns it all the gathered data.
 * @param {string} anime - Anime name.
 * @returns {string} Fetched data in Telegram standards.
 */
const animeSearch = anime => {
    const errorMessage = '*Anime not found: search it again, please.*';

    if('' != anime)
        return nani.get(`anime/search/${anime}`)
                   .then(data => replyAnime(data[0]))
                   .catch(error => {
                       console.log('[Error] animeSearch:', error)
                       return errorMessage
                   });
    else
        return Promise.resolve(errorMessage);
}

/**
 * Search for character and returns it all the gathered data.
 * @param {string} character - Character name.
 * @returns {string} Fetched data in Telegram standards.
 */
const characterSearch = character => {
    const errorMessage = '*Character not found: search it again, please.*';

    if('' != character)
        return nani.get(`character/search/${character}`)
                   .then(data => replyCharacter(data[0]))
                   .catch(error => {
                       console.log('[Error] characterSearch:', error)
                       return errorMessage
                   });
    else
        return Promise.resolve(errorMessage);
}

/**
 * Search for staff and fetch it the gathered data.
 * @param {string} search - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const staffSearch = search => {
    const errorMessage = `*Staff not found: search it again, please.*`;

    if('' != search)
        return nani.get(`staff/search/${search}`)
                   .then(data => replyStaff(data[0]))
                   .catch(error => {
                       console.log('[Error] staffSearch:', error)
                       return errorMessage
                   });
    else
        return Promise.resolve(errorMessage);
}

/**
 * Search for studio and fetch it the gathered data.
 * @param {string} search - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const studioSearch = search => {
    const errorMessage = `*Studio not found: search it again, please.*`;

    if('' != search)
        return nani.get(`studio/search/${search}`)
                   .then(data => replyStudio(data[0]))
                   .catch(error => {
                       console.log('[Error] studioSearch:', error)
                       return errorMessage
                   });
    else
        return Promise.resolve(errorMessage);
}

/**
 * Query all info about searched element.
 * @param {string} type - What kind of content array represents
 * @param {Array.<json>} array - Results from Anilist API.
 * @returns {Object[]} All of searched data in Telegram inline standards.
 */
const __inlineSearch = (type, array) => {
    return Promise.all(array.map(data => replyInline(type, data)))
                  .catch(error => {
                      console.log('[Error] __inlineSearch Promise:', error)
                      return [notFound]
                  });
}

/**
 * Search it all the matches for the user query.
 * @param {string} query - User input.
 * @returns {Object[]} All of searched data in Telegram inline standards.
 */
const inlineSearch = query => {
    const types = ['anime', 'character', 'staff', 'studio'];

    if('' == query)
        return Promise.resolve([search]);
    else
        return Promise.all(types.map(type => {
            return nani.get(`${type}/search/${query}`)
                       .then(data => {
                           /*  Case that the search was not successfully   */
                           return (!data.hasOwnProperty('error')) ? __inlineSearch(type, data) : null;
                       })
                       .catch(error => {
                           console.log('[Error] inlineSearch nani:', error);
                           return [notFound];
                       })
        }))
        .then(data => {
            /*  Flatening array */
            return data.reduce((acc, cur) => {
                if(null != cur)
                    acc = acc.concat(cur)
                return acc
            }, []);
        })
        .then(data => {
            if(0 == data.length)
                data = [notFound];
            /*  Telegram only supports to 20 query results  */
            else
                data = data.slice(0, 19);

            return data;
        })
        .catch(error => {
            console.log('[Error] inlineSearch:', error);
            return [notFound];
        })
}

/***********************************************************************************************************************
 *********************************************** OTHER FUNCTIONS *******************************************************
 **********************************************************************************************************************/

/**
 * This function answer the response for data in buttons.
 * @param {DB} db - Users database.
 * @param {string} id - Anilist data id.
 * @param {string} type - type of the data: anime, manga or staff.
 * @param {string} button - type of the button.
 * @returns {string} Message to be printed.
 */
const buttons = (db, user, id, type, button) => {
    return Promise.resolve( 
               nani.get(`${type}/${id}`)
                   .then(data => {
                       let response;

                       switch(button) {
                           case 'description':
                               const search = ('staff' == type || 'character' == type) ? data.info : data.description;
                               const description = verifyData(search);
                               response = (196 < description.length) ? replyCallback(description.substring(0, 196)) : description;
                               break;
                           case 'genres':
                               response = verifyObject(data.genres);
                               break;
                           case 'users':
                               response = replyUsers(data.list_stats);
                               break;
                            case 'watchlist':
                               response = db.addEntry(user, id);
                               break;
                           default:
                               response = 'Not Available';
                       }

                       return response;
                   })
                  .catch((error) => console.log('[Error] Buttons Nani:', error))
            )
            .catch((error) => console.log('[Error] Buttons Promise:', error))
}


/**
 * Given anime ID, returns a formated Telegram layout info.
 * @param {Number} id - Anime id.
 * @returns Anime formated Telegram layout.
 */
const getAnimeID = id => {
    return Promise.resolve(
        nani.get(`anime/${id}`)
            .then(data => replyAnime(data))
            .catch((error) => {
                console.log('[Error] getAnimeID nani:', error)
                return '*Anime not found.*';
            })
    )
    .catch((error) => {
        console.log('[Error] getAnimeID Promise:', error)
        return '*Anime not found.*';
    });
}

/**
 * Returs all the fetched user watlist data into Telegram standars.
 * @param {Number[]} array - Animes ids.
 * @param {Number} index - Optional, but given anime index, search for its data.
 * @returns Watchlist
 */
const watchlist = (array, index) => {
    if(0 != array.length) {
        if(index) {
            const positions = verifyNumbers(index);

            if(positions.length > 0)
                return Promise.all(positions.map(pos => {
                    if(0 <= pos && pos < array.length)
                        return getAnimeID(array[pos]).then(data => data)
                }))
                /*  Filter so that any undefined value must be removed  v*/
                .then(data => data.filter(element => element))
                .then(data => {
                    if(0 < data.length)
                        return data
                    else
                        return '*Invalid index*';
                })
                .catch(error => {
                    console.log('[Error] wachlist Promise index:', error);
                    return '*Invalid index*';
                })

            else
                return Promise.resolve('*Invalid index*');
        }
        else
            return Promise.all(array.map((data, index) => replyWatchlist(index, data)))
                      .then(data => data.join('\n').concat(watchMessage))
                      .catch(error => {
                          console.log('[Error] watchlist Promise 2:', error);
                          return '*Anime not found*';
                      });
    }
    else
        return Promise.resolve(empty);
}

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    buttons,
    inlineSearch,
    animeSearch,
    characterSearch,
    staffSearch,
    studioSearch,
    watchlist
}

