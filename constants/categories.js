if (process.env.APPLICATION === "WALDI") {
    module.exports = {
        News: 1,
        RoadWorksOrTraffic: 2,
        Events: 3,
        Clubs: 4,
        // RegionalProducts: 5,
        OfferOrSearch: 6,
        // NewCitizenInfo: 7,
        DefectReport: 8,
        // LostAndFound: 10,
        CompanyPortraits: 10,
        CarpoolingOrPublicTransport: 11,
        eatOrDrink: 13,
        rathaus:14,
        newsletter:15,
        officialnotification:16
    }
} else {
    module.exports = {
        News: 1,
        RoadWorksOrTraffic: 2,
        Events: 3,
        Clubs: 4,
        RegionalProducts: 5,
        OfferOrSearch: 6,
        NewCitizenInfo: 7,
        DefectReport: 8,
        LostAndFound:9,
        CompanyPortraits: 10,
        CarpoolingOrPublicTransport: 11,
        Offers: 12,
        eatOrDrink: 13,
        rathaus:14,
        newsletter:15,
        officialnotification:16,
        AppointmentBooking: 18,
        DefectReporter: 19,
        Applicants: 20,
        Polls: 25
    }
}
