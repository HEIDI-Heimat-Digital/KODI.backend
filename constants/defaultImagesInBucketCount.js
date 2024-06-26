
if (process.env.APPLICATION === "WALDI") {
    module.exports = {
        News: 11,
        RoadWorksOrTraffic: 0,
        Events: 9,
        Clubs: 9,
        // RegionalProducts: 5,
        OfferOrSearch: 8,
        // NewCitizenInfo: 7,
        DefectReport: 0,
        LostAndFound: 7,
        // CompanyPortraits: 11,
        CoronaInfo: 0,
        CarpoolingOrPublicTransport: 11,
        Surveys: 0,
        Weather: 0,
        Offers: 9,
        EatOrDrink:1
    };
} else {
    module.exports = {
        News: 11,
        RoadWorksOrTraffic: 0,
        Events: 9,
        Clubs: 9,
        RegionalProducts: 8,
        OfferOrSearch: 8,
        NewCitizenInfo: 11,
        DefectReport: 0,
        LostAndFound: 7,
        CompanyPortraits: 8,
        CoronaInfo: 0,
        CarpoolingOrPublicTransport: 11,
        Surveys: 0,
        Weather: 0,
        Offers: 9,
        EatOrDrink:1,
        AppointmentBooking:9,
        DefectReporter:6,
        Applicants:4
    };
}