const database = require("../services/database");
const tables = require("../constants/tableNames");
const AppError = require("../utils/appError");
const status = require("../constants/status");
const categories = require("../constants/categories");
const subcategories = require("../constants/subcategories");
const source = require("../constants/source");
const roles = require("../constants/roles");
const getDateInFormate = require("../utils/getDateInFormate");
const TurndownService = require('turndown')
const showdown = require('showdown')
const defaultImageCount = require("../constants/defaultImagesInBucketCount");
const DEFAULTIMAGE = "Defaultimage";
const sendPushNotification = require("../services/sendPushNotification");

async function createListing(cityIds, payload, userId, roleId) {
    const insertionData = {};
    let user = {};
    const cities = {};
    const hasDefaultImage =
        (payload.logo !== undefined && payload.logo !== null) ||
            payload.hasAttachment
            ? false
            : true;

    if (!payload) {
        throw new AppError(`Empty payload sent`, 400);
    }

    if (!cityIds) {
        throw new AppError(`City is not present`, 404);
    } else {
        try {
            for (const cityId of cityIds) {
                const response = await database.get(tables.CITIES_TABLE, {
                    id: cityId,
                });
                if (response.rows && response.rows.length === 0) {
                    throw new AppError(`Invalid City '${cityId}' given`, 400);
                }
                cities[cityId] = response.rows[0]
            }
        } catch (err) {
            throw new AppError(err);
        }
    }

    try {
        const response = await database.get(tables.USER_TABLE, { id: userId });
        const data = response.rows;
        if (data && data.length === 0) {
            throw new AppError(`Invalid User '${userId}' given`, 400);
        }
        user = data[0];
    } catch (err) {
        throw new AppError(err);
    }

    // this will only be available for single cities for now
    if (
        typeof parseInt(payload.villageId) === "number" &&
        parseInt(payload.villageId) !== 0 &&
        cityIds.length === 1
    ) {
        try {
            const response = await database.get(
                tables.VILLAGE_TABLE,
                { id: payload.villageId },
                null,
                cityIds[0]
            );

            const data = response.rows;
            if (data && data.length === 0) {
                throw new AppError(`Invalid Village id '${payload.villageId}' given`, 400);
            } else {
                insertionData.villageId = payload.villageId;
            }
        } catch (err) {
            throw new AppError(err);
        }
    } else {
        insertionData.villageId = null;
    }

    if (!payload.title) {
        throw new AppError(`Title is not present`, 400);
    } else if (payload.title.length > 255) {
        throw new AppError(`Length of Title cannot exceed 255 characters`, 400);
    } else {
        insertionData.title = payload.title;
    }
    if (!payload.place) {
        insertionData.place = payload.place;
    }

    if (!payload.description) {
        throw new AppError(`Description is not present`, 400);
    } else if (payload.description.length > 65535) {
        throw new AppError(`Length of Description cannot exceed 65535 characters`, 400);
    } else {

        insertionData.description = checkDesc(payload.description);
    }
    if (payload.media) {
        insertionData.media = payload.media;
    }
    let isPoll = false;
    let subcategory = false;
    if (!payload.categoryId) {
        throw new AppError(`Category is not present`, 400);
    } else {
        try {
            const response = await database.get(
                tables.CATEGORIES_TABLE,
                { id: payload.categoryId },
                null
            );

            const data = response.rows;
            if (data && data.length === 0) {
                throw new AppError(`Invalid Category '${payload.categoryId}' given`, 400);
            }
            if (data[0].noOfSubcategories > 0) subcategory = true;

            isPoll = response.rows[0].id === categories.Polls;
        } catch (err) {
            throw new AppError(err);
        }
        insertionData.categoryId = payload.categoryId;
    }

    if (payload.subcategoryId && subcategory) {
        if (!subcategory) {
            throw new AppError(
                `Invalid Sub Category. Category Id = '${payload.categoryId}' doesn't have a subcategory.`,
                400
            );
        }
        try {
            const response = await database.get(
                tables.SUBCATEGORIES_TABLE,
                { id: payload.subcategoryId },
                null
            );

            const data = response.rows;
            if (data && data.length === 0) {
                throw new AppError(
                    `Invalid Sub Category '${payload.subcategoryId}' given`,
                    400
                );
            }
        } catch (err) {
            throw new AppError(err);
        }
        insertionData.subcategoryId = payload.subcategoryId;
    }

    if (!payload.statusId) {
        insertionData.statusId = status.Pending;
    } else {
        if (roleId !== roles.Admin) {
            insertionData.statusId = status.Pending;
        } else {
            try {
                const response = await database.get(
                    tables.STATUS_TABLE,
                    { id: payload.statusId },
                    null
                );

                const data = response.rows;
                if (data && data.length === 0) {
                    throw new AppError(`Invalid Status '${payload.statusId}' given`, 400);
                }
            } catch (err) {
                throw new AppError(err);
            }
            insertionData.statusId = payload.statusId;
        }
    }

    insertionData.sourceId = source.UserEntry;

    if (payload.address) {
        insertionData.address = payload.address;
    }

    if (payload.email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(payload.email)) {
            throw new AppError(`Invalid email Id given`, 400);
        }
        insertionData.email = payload.email;
    }

    if (payload.phone) {
        const re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
        if (!re.test(payload.phone)) {
            throw new AppError(`Invalid Phone number given`, 400);
        }
        insertionData.phone = payload.phone;
    }

    if (payload.website) {
        insertionData.website = payload.website;
    }

    if (payload.price) {
        insertionData.price = payload.price;
    }

    if (payload.discountPrice) {
        insertionData.discountPrice = payload.discountPrice;
    }
    if (payload.logo) {
        insertionData.logo = payload.logo;
    }

    if (payload.longitude) {
        insertionData.longitude = payload.longitude;
    }

    if (payload.latitude) {
        insertionData.latitude = payload.latitude;
    }

    if (payload.zipcode) {
        insertionData.zipcode = payload.zipcode;
    }

    insertionData.createdAt = getDateInFormate(new Date());

    try {
        if (parseInt(payload.categoryId) === categories.News && !payload.timeless) {
            if (payload.expiryDate) {
                insertionData.expiryDate = payload.expiryDate;
            } else {
                insertionData.expiryDate = getDateInFormate(
                    new Date(
                        new Date(insertionData.createdAt).getTime() +
                        1000 * 60 * 60 * 24 * 14
                    )
                );
            }
        }

        if (parseInt(payload.categoryId) === categories.Events) {
            if (payload.startDate) {
                insertionData.startDate = getDateInFormate(new Date(payload.startDate));
            } else {
                throw new AppError(`Start date is not present`, 400);
            }

            if (payload.endDate) {
                insertionData.endDate = getDateInFormate(new Date(payload.endDate));
                insertionData.expiryDate = getDateInFormate(
                    new Date(new Date(payload.endDate).getTime() + 1000 * 60 * 60 * 24)
                );
            } else {
                insertionData.expiryDate = getDateInFormate(
                    new Date(new Date(payload.startDate).getTime() + 1000 * 60 * 60 * 24)
                );
            }
        }
    } catch (error) {
        throw new AppError(`Invalid time format ${error}`, 400);
    }

    const allResponses = []

    try {
        for (const cityId of cityIds) {
            let response = {};
            const city = cities[cityId]
            if (city.isAdminListings) {
                // If the city is admin listings, we need directly set the user id of the listing as 1 (i.e. admin's id)
                insertionData.userId = 1;
            } else {
                response = await database.get(tables.USER_CITYUSER_MAPPING_TABLE, {
                    cityId,
                    userId
                });

                if (!response.rows || response.rows.length === 0) {
                    user.coreUserId = userId;
                    delete user.id;
                    delete user.password;
                    delete user.socialMedia;
                    delete user.emailVerified;
                    response = await database.create(tables.USER_TABLE, user, cityId);

                    const cityUserId = response.id;
                    await database.create(tables.USER_CITYUSER_MAPPING_TABLE, {
                        cityId,
                        userId,
                        cityUserId,
                    });
                    insertionData.userId = cityUserId;
                } else {
                    insertionData.userId = response.rows[0].cityUserId;
                }
            }

            response = await database.create(
                tables.LISTINGS_TABLE,
                insertionData,
                cityId
            );

            const listingId = response.id;
            await database.create(tables.USER_LISTING_MAPPING_TABLE, {
                cityId,
                userId,
                listingId,
            });


            // verify if the listing is a poll and has poll options
            // verify if the poll options are less than or equal to 10
            // verify the poll options is an array
            // verify the poll options is not empty
            // verify if the listing is a poll
            if (isPoll) {
                if (!payload.pollOptions || !Array.isArray(payload.pollOptions) || payload.pollOptions.length === 0) {
                    throw new AppError(`Invalid Poll Options`, 400);
                } else if(payload.pollOptions.length > 10){
                    throw new AppError(`Poll options length cannot exceed 10`)
                }else {
                    // verify that no two poll options have the same title
                    const pollOptions = payload.pollOptions.map((option) => option.title);
                    if (new Set(pollOptions).size !== pollOptions.length) {
                        throw new AppError(`Poll Options cannot have the same title`, 400);
                    }
                    for (const option of payload.pollOptions) {
                        await database.create(tables.POLL_OPTIONS_TABLE, {
                            listingId,
                            title: option.title,
                        }, cityId);
                    }
                }
            }
            allResponses.push({
                cityId: Number(cityId),
                listingId
            })

            if (hasDefaultImage) {
                addDefaultImage(cityId, listingId, payload.categoryId);
            }

            if (
                parseInt(insertionData.categoryId) === categories.News &&
                parseInt(insertionData.subcategoryId) === subcategories.newsflash &&
                insertionData.statusId === status.Active &&
                roleId === roles.Admin
            ) {
                await sendPushNotification.sendPushNotificationToAll(
                    "warnings",
                    "Eilmeldung",
                    city.name + " - " + insertionData.title,
                    { cityId: cityId.toString(), id: listingId.toString() }
                );
            }
        }

        return allResponses;
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err);
    }
}

const checkDesc = (desc) => {
    const turndownService = new TurndownService()
    const markdown = turndownService.turndown(desc)
    const converter = new showdown.Converter()
    const html = converter.makeHtml(markdown)
    return html
}

async function addDefaultImage(cityId, listingId, categoryId) {
    const imageOrder = 1;
    const categoryName = Object.keys(categories).find(
        (key) => categories[key] === +categoryId
    );
    const query = `select count(LI.id) as LICount from heidi_city_${cityId}.listing_images LI where LI.logo like '%${categoryName}%'`;
    const categoryImage = await database.callQuery(query);
    const categoryCount = categoryImage.rows.length > 0 && categoryImage.rows[0].LICount || 0;
    const moduloValue = ((categoryCount % defaultImageCount[categoryName]) || 0) + 1;
    const imageName = `admin/${categoryName}/${DEFAULTIMAGE}${moduloValue}.png`;
    return await database.create(
        tables.LISTINGS_IMAGES_TABLE,
        {
            listingId,
            imageOrder,
            logo: imageName,
        },
        cityId
    );
}

module.exports = { createListing };
