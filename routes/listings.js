const express = require("express");
const router = express.Router();
const database = require("../services/database");
const tables = require("../constants/tableNames");
const supportedLanguages = require("../constants/supportedLanguages");
const AppError = require("../utils/appError");
const deepl = require("deepl-node");

router.get("/", async function (req, res, next) {
    const params = req.query;
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 9;
    const filters = {};
    let sortByStartDate = false;

    if (isNaN(Number(pageNo)) || Number(pageNo) <= 0) {
        return next(
            new AppError(`Please enter a positive integer for pageNo`, 400)
        );
    }
    if (
        isNaN(Number(pageSize)) ||
    Number(pageSize) <= 0 ||
    Number(pageSize) > 20
    ) {
        return next(
            new AppError(
                `Please enter a positive integer less than or equal to 20 for pageSize`,
                400
            )
        );
    }

    if (params.sortByStartDate) {
        const sortByStartDateString = params.sortByStartDate.toString()
        if (sortByStartDateString !== 'true' && sortByStartDateString !== 'false') {
            return next(
                new AppError(`The parameter sortByCreatedDate can only be a boolean`, 400)
            );
        } else {
            sortByStartDate = sortByStartDateString === 'true';
        }
    }

    if (params.statusId) {
        try {
            const response = await database.get(
                tables.STATUS_TABLE,
                { id: params.statusId },
                null
            );
            const data = response.rows;
            if (data && data.length === 0) {
                return next(
                    new AppError(`Invalid Status '${params.statusId}' given`, 400)
                );
            }
        } catch (err) {
            return next(new AppError(err));
        }
        filters.statusId = params.statusId;
    }

    if (params.categoryId) {
        try {
            let response = await database.get(
                tables.CATEGORIES_TABLE,
                { id: params.categoryId },
                null
            );
            const data = response.rows;
            if (data && data.length === 0) {
                return next(
                    new AppError(`Invalid Category '${params.categoryId}' given`, 400)
                );
            } else {
                if (params.subCategoryId) {
                    try {
                        response = database.get(tables.SUBCATEGORIES_TABLE, {
                            categoryId: params.categoryId,
                        });
                        const data = response.rows;
                        if (data && data.length === 0) {
                            return next(
                                new AppError(
                                    `Invalid subCategory '${params.subCategoryId}' given`,
                                    400
                                )
                            );
                        }
                    } catch (err) {
                        return next(new AppError(err));
                    }
                    filters.subCategoryId = params.subCategoryId;
                }
            }
        } catch (err) {
            return next(new AppError(err));
        }
        filters.categoryId = params.categoryId;
    }

    if (params.cityId) {
        try {
            let response = await database.get(
                tables.CITIES_TABLE,
                { id: params.cityId },
                null
            );
            const data = response.rows;
            if (data && data.length === 0) {
                return next(
                    new AppError(`Invalid CityId '${params.cityId}' given`, 400)
                );
            } else {
                const sortBy = sortByStartDate ?  ["startDate", "createdAt"] : ["createdAt desc"];
                response = await database.get(
                    tables.LISTINGS_TABLE,
                    filters,
                    `*, ${params.cityId} as cityId`,
                    params.cityId,
                    pageNo,
                    pageSize,
                    sortBy,
                    true
                );
                return res.status(200).json({
                    status: "success",
                    data: response.rows,
                });
            }
        } catch (err) {
            return next(new AppError(err));
        }
    }

    try {
        let response = await database.get(tables.CITIES_TABLE);
        const cities = response.rows;
        const individualQueries = [];
        for (const city of cities) {
            // if the city database is present in the city's server, then we create a federated table in the format
            // heidi_city_{id}_listings and heidi_city_{id}_users in the core databse which points to the listings and users table respectively
            let query = `SELECT L.*, U.username, ${
                city.id
            } as cityId FROM heidi_city_${city.id}${
                city.inCityServer ? "_" : "."
            }listings L 
			inner join heidi_city_${city.id}${city.inCityServer ? "_" : "."}
            users U on U.id = L.userId `;
            if (filters.categoryId || filters.statusId) {
                query += " WHERE ";
                if (filters.categoryId) {
                    query += `L.categoryId = ${params.categoryId} AND `;
                }
                if (filters.subCategoryId) {
                    query += `L.subCategoryId = ${params.subCategoryId} AND `;
                }
                if (filters.statusId) {
                    query += `L.statusId = ${params.statusId} AND `;
                }
                query = query.slice(0, -4);
            }
            individualQueries.push(query);
        }

        const query = `select * from (
                ${individualQueries.join(" union all ")}
            ) a order by ${sortByStartDate ?  "startDate, createdAt" : "createdAt desc"} LIMIT ${(pageNo - 1) * pageSize}, ${pageSize};`;
        response = await database.callQuery(query);

        const listings = response.rows;
        const noOfListings = listings.length;
        if (
            noOfListings > 0 &&
      params.translate &&
      supportedLanguages.includes(params.translate)
        ) {
            const textToTranslate = [];
            listings.forEach((listing) => {
                textToTranslate.push(listing.title);
                textToTranslate.push(listing.description);
            });
            const translator = new deepl.Translator(process.env.DEEPL_AUTH_KEY);
            const translations = await translator.translateText(
                textToTranslate,
                null,
                params.translate
            );
            for (let i = 0; i < noOfListings; i++) {
                if (
                    translations[2 * i].detectedSourceLang !== params.translate.slice(0, 2)
                ) {
                    listings[i].titleLanguage = translations[2 * i].detectedSourceLang;
                    listings[i].titleTranslation = translations[2 * i].text;
                }
                if (
                    translations[2 * i + 1].detectedSourceLang !==
          params.translate.slice(0, 2)
                ) {
                    listings[i].descriptionLanguage =
            translations[2 * i + 1].detectedSourceLang;
                    listings[i].descriptionTranslation = translations[2 * i + 1].text;
                }
            }
        }
        return res.status(200).json({
            status: "success",
            data: response.rows,
        });
    } catch (err) {
        return next(new AppError(err));
    }
});

module.exports = router;