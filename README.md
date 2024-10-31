# tictactoe-frontend

Sukurti dviejų žaidėjų kryžiukų-nuliukų žaidimą, kuriame vartotojai galėtų žaisti realiuoju laiku. 
Žaidimo būsena bus saugoma Redis duomenų bazėje, o WebSockets leis atnaujinti žaidimo lentą abiejuose žaidėjų pusėse realiu laiku.

Projekto technologijos

Java Spring Boot – serverio daliai sukurti.

WebSockets – realaus laiko pranešimams perduoti tarp žaidėjų.

Redis – žaidimo būsenai saugoti.

HTML/CSS/JavaScript – kliento sąsajos sukūrimui ir stiliaus pritaikymui.

Prieš pradedant, prie sesijos turi prisijungti du žaidėjai - įvesdami vardus.

Sukurti DockerFile, kuris gebėtų paleisti pilną aplinką žaidimui.
