module.exports = function (firstName, lastName) {
    return {
        Subject: "Dein Account wurde erfolgreich verifiziert",
        body: `<h1> Dein Account wurde erfolgreich verifiziert",</h1>
                <p>Hey ${firstName} ${lastName},<br>
                Dein Account wurde erfolgreich verifizier.<br>
                <br>
                Liebe Grüße!,<br>
                Das ${process.env.REGION}-Team</p>`

    }
}