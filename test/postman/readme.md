
## postman_heidi_local.json
Create two users with these values in the create payload.
```
{
  "username": "johndoe",
  "password": "MyPassword123"
}
```
and

```
{
  "username": "johndoe1",
  "password": "MyPassword123"
}
```

Go to the database and mark the user with johndoe as an admin user. You can do so using the sql command:
```
 UPDATE `heidi_core`.`users` SET `roleId` = '1' WHERE (`username` = 'johndoe');
```

Also, go to the folder favorites in postman under this collection.
In the pre-request test of all the endpoints, update the following line
```
 pm.variables.set("current_user_id", "23");
```
with 
```
pm.variables.set("current_user_id", {{userID}});
```

where `{{userID}}` is the ID from the following query


```
 SELECT ID from `heidi_core`.`users` WHERE `username` = 'johndoe1'
```

You can run all the folders at the same time. Or each folders one by one.


## Heidi_Local_Legacy.postman_collection.json

There are some tables not present now like village:
To add them run these scripts in sql

```
INSERT INTO  heidi_city_1.village(id, name) 
VALUES(1,'first village'); 
-- This is to add a new village to the city with id 1
```

```
INSERT INTO heidi_core.citizen_services (id, title, image, link)
VALUES (1, 'Digitale Verwaltung', 'admin/CitizenService1.jpg', 'https://vgem-fuchstal.de/vg-fuchstal/was-erledige-ich-wo/#online-antraege');
```

```
INSERT INTO heidi_core.digital_management (id, cityId, title, link, image)
VALUES (1, 1, 'Digitale Verwaltung', 'https://vgem-fuchstal.de/vg-fuchstal/was-erledige-ich-wo/#online-antraege', 'admin/CitizenService1.jpg');
```

```
INSERT INTO heidi_core.moreinfo (title, link, isPdf)
VALUES ('Digitale Verwaltung', 'https://vgem-fuchstal.de/vg-fuchstal/was-erledige-ich-wo/#online-antraege', 0);
```
