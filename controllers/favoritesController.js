const favoritesService = require("../services/favoritesService");
const AppError = require("../utils/appError");
const categoriesService = require("../services/categoryService");
const citiesService = require("../services/cities");
const listingService = require("../services/listingService");

const getAllFavoritesForUser = async function (req, res, next) {
    const userId = parseInt(req.paramUserId);
    if (isNaN(Number(userId)) || Number(userId) <= 0) {
        next(new AppError(`Invalid userId ${userId}`, 400));
        return;
    }
    if (userId !== parseInt(req.userId)) {
        return next(
            new AppError(`You are not allowed to access this resource`, 403)
        );
    }
    try {
        const response = await favoritesService.getFavoritesforUser(userId);
        res.status(200).json({
            status: "success",
            data: response,
        });
    } catch (err) {
        return next(new AppError(err));
    }
}

const getFavoriteListingsForUser = async function (req, res, next) {
    const userId = parseInt(req.paramUserId);
    const params = req.query;
    let listings = [];
    const listingFilter = {}
    const favFilter = {
        userId
    }
    if (isNaN(Number(userId)) || Number(userId) <= 0) {
        next(new AppError(`Invalid userId ${userId}`, 400));
        return;
    }
    if (userId !== parseInt(req.userId)) {
        return next(
            new AppError(`You are not allowed to access this resource`, 403)
        );
    }

    if (params.categoryId) {
        try {
            const data  = await categoriesService.getCategoryById(parseInt(params.categoryId));
            if (data.length === 0) {
                return next(
                    new AppError(`Invalid Category '${params.categoryId}' given`, 400)
                );
            }
            listingFilter.categoryId = params.categoryId;
        } catch (err) {
            return next(new AppError(err));
        }
    }

    if (params.cityId) {
        try {
            const cities = await citiesService.getCityWithId(parseInt(params.cityId));
            if(cities.length===0){
                return next(
                    new AppError(`Invalid CityId '${params.cityId}' given`, 400)
                );
            }
            favFilter.cityId = params.cityId;
        } catch (err) {
            return next(new AppError(err));
        }
    }

    try {
        // let response = await database.get(tables.FAVORITES_TABLE, favFilter);
        let response = await favoritesService.getFavoritesWithFilter(favFilter);
        const favDict = {};
        response.forEach((fav) => {
            const cityId = fav.cityId;
            const listingId = fav.listingId;
            if (favDict[cityId]) {
                favDict[cityId].push(listingId);
            } else {
                favDict[cityId] = [listingId];
            }
        });
        listings = [];
        for (const cityId in favDict) {
            listingFilter.id = favDict[cityId];
            response = await listingService.getAllListingsWithFilters( listingFilter, cityId);
            response.forEach((l) => (l.cityId = cityId));
            listings.push(...response);
        }
    } catch (err) {
        console.log(err);
        return next(new AppError(err));
    }
    res.status(200).json({
        status: "success",
        data: listings,
    });
};

module.exports = {
    getAllFavoritesForUser,
    getFavoriteListingsForUser,
}