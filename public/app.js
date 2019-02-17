var config = {
    apiKey: "AIzaSyB3q1AjHKr1LguKsDgJAjKzfdouS71w-dY",
    authDomain: "nterra-fuhrpark.firebaseapp.com",
    databaseURL: "https://nterra-fuhrpark.firebaseio.com",
    projectId: "nterra-fuhrpark",
    storageBucket: "nterra-fuhrpark.appspot.com",
    messagingSenderId: "95164735355"
};
firebase.initializeApp(config);
const db = firebase.firestore();

// Sign-in to Google
function googleLogin() {
    // Sets the persistence to session, so the user is automatically signed-out if he closes the tab or window
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function () {
                var userMail = firebase.auth().currentUser.email;
                if (validAccount(userMail)) {
                    window.location.hash = "home"
                    GenerateTableNew();
                }
                else {
                    googleLogout();
                }
            })
        })
}

// Checks if the users account is an nterra.com domain
function validAccount(userEmail) {
    return userEmail.split('@')[1] == 'nterra.com';
}

// Sign-out
function googleLogout() {
    firebase.auth().signOut();
}

// Initiate Firebase Auth
function initFirebaseAuth() {
    firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns true if User is signed-in
function isUserSignedIn() {
    return !!firebase.auth().currentUser;
}

// Returns User name
function getUserName() {
    return firebase.auth().currentUser.displayName;
}

// Returns user pic
function getUserPicUrl() {
    return firebase.auth().currentUser.photoURL;
}

// Triggers when the Auth State changes for instance when the user signs in or out
function authStateObserver(user) {
    console.log('hi');
    // if a user is signed in his email and his google profile picture are injected into the document
    if (user) {
        var username = getUserName();
        var userPicUrl = getUserPicUrl();

        document.getElementById('username').textContent = username;
        document.getElementById('userpic').style.backgroundImage = 'url(' + userPicUrl + ')';

        document.getElementById('navileiste').style.display = 'grid'
        document.getElementById('homebutton').style.display = 'inline';
        document.getElementById('workerbutton').style.display = 'inline';
        document.getElementById('carbutton').style.display = 'inline';
        document.getElementById('licensebutton').style.display = 'inline';
        document.getElementById('editbutton').style.display = 'inline';
        document.getElementById('libutton').style.display = 'none';
        document.getElementById('lobutton').style.display = 'inline';
        document.getElementById('userpic').style.display = 'inline-block';
        document.getElementById('username').style.display = 'inline';
    }
    // if the user is not signed in he gets redirected to the welcome page
    else {
        document.getElementById('navileiste').style.display = 'none';
        document.getElementById('homebutton').style.display = 'none';
        document.getElementById('workerbutton').style.display = 'none';
        document.getElementById('carbutton').style.display = 'none';
        document.getElementById('licensebutton').style.display = 'none';
        document.getElementById('editbutton').style.display = 'none';
        document.getElementById('libutton').style.display = 'inline';
        document.getElementById('libutton').style.marginRight = '20px';
        document.getElementById('lobutton').style.display = 'none';
        document.getElementById('username').style.display = 'none';
        document.getElementById('userpic').style.display = 'none';
        hideAllPages();
        window.location.hash = "welcome";
    }
}

// Triggers when the windows hash value changes and updates the ui accordingly
window.onhashchange = function () {
    // hides the currently visible page
    hideAllPages();
    var currentHash = window.location.hash;
    // if the user is not signed in he is redirected to the welcome page
    if (!firebase.auth().currentUser) {
        currentHash = "#welcome";
    }
    // user is shown the page accordingly to the current hash
    if (currentHash == '#home') {
        document.getElementsByClassName('home')[0].style.display = 'grid';
    }
    else if (currentHash == '#mitarbeiter') {
        document.getElementsByClassName('mitarbeiter')[0].style.display = 'grid';
    }
    else if (currentHash == '#fahrzeuge') {
        document.getElementsByClassName('fahrzeuge')[0].style.display = 'grid';
        document.getElementById('carform').reset();
        resetCarform();
    }
    else if (currentHash == '#fuehrerschein') {
        document.getElementsByClassName('fuehrerschein')[0].style.display = 'grid';
        document.getElementById('emailtext').value = "";
    }
    else if (currentHash == '#editor') {
        document.getElementsByClassName('editor')[0].style.display = 'grid';
        fillDatalist("Mitarbeiter", "EditorList");
    }
    else if (currentHash == '#uebersicht') {
        document.getElementsByClassName('uebersicht')[0].style.display = 'grid';
        exportCars(true, "exporttablef");
        exportCars(false, "exporttablem");
    }
    else if (currentHash == '#datenbank') {
        document.getElementsByClassName('datenbank')[0].style.display = 'grid';
    }
    else if (currentHash == '#welcome') {
        return;
    }
    else {
        document.getElementsByClassName('error')[0].style.display = 'grid';
    }
};

// Sets the windows hash value according to which button is pressed in the bavigation bar
function setHash(page) {
    if (!isUserSignedIn()) {
        // Show alert
        document.querySelector('.useralert').style.display = 'block';

        // Hide alert after 3 seconds
        setTimeout(function () {
            document.querySelector('.useralert').style.display = 'none';
        }, 5000);
        return;
    }
    else {
        window.location.hash = page;
    }
}

// Hides all pages
function hideAllPages() {
    var pages = document.getElementsByClassName("page")
    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
    }
}

// Reference Firmenwagen collection
var fahrzeugeRef = db.collection('Fahrzeuge');

// Reference Mitarbeiter collection
var mitarbeiterRef = db.collection('Mitarbeiter');

// Listen for click on the form radio buttons
document.getElementById('firmenwagen').addEventListener('click', changeFormFirm);

// Updates the form if the Firmenwagen radio is clicked
function changeFormFirm(e) {
    document.getElementsByClassName('uedatum')[1].style.visibility = 'hidden';
    document.getElementsByClassName('fklasse')[0].style.display = 'none';
    document.getElementsByClassName('vnummer')[1].style.display = 'block';
    document.getElementsByClassName('vdaten')[0].style.display = 'block';
    document.getElementsByClassName('cnummer')[0].style.display = 'block';
    document.getElementsByClassName('cende')[0].style.display = 'block';
    document.getElementsByClassName('mileage')[0].style.display = 'block';
    document.getElementsByClassName('odatum')[0].style.display = 'block';
}

// Listen for click on the form radio buttons
document.getElementById('mietwagen').addEventListener('click', changeFormMiet);

// Updates the form if the Mietwagen radio is clicked
function changeFormMiet(e) {
    document.getElementsByClassName('uedatum')[1].style.visibility = 'visible';
    document.getElementsByClassName('fklasse')[0].style.display = 'block';
    document.getElementsByClassName('vnummer')[1].style.display = 'none';
    document.getElementsByClassName('vdaten')[0].style.display = 'none';
    document.getElementsByClassName('cnummer')[0].style.display = 'none';
    document.getElementsByClassName('cende')[0].style.display = 'none';
    document.getElementsByClassName('mileage')[0].style.display = 'none';
    document.getElementsByClassName('odatum')[0].style.display = 'none';
}

// Listen for form submit
document.getElementById('carform').addEventListener('submit', submitForm);

// Submit Form
function submitForm(e) {
    e.preventDefault();

    // Get values of the input fields
    if (getRadioValues() == "Firmenwagen") {
        var art = getRadioValues();
        var model = getInputValues('model');
        var kennzeichen = getInputValues('kennzeichen').toUpperCase();
        var fahrer = getInputValues('fahrer').toLowerCase();
        var blp = getInputValues('blp');
        var vnummer = getInputValues('vnummer');
        var zuzahlung = getInputValues('zuzahlung');
        var odatum = getInputValues('odatum');
        var mileage = getInputValues('mileage');
        var cende = getInputValues('cende');
        var cnummer = getInputValues('cnummer');

        // Save Firmenwagen to the database
        saveFirmenwagen(art, model, kennzeichen, fahrer, blp, vnummer, zuzahlung, odatum, mileage, cende, cnummer);
    }
    else {
        var art = getRadioValues();
        var uedate = getInputValues('uedatum');
        var model = getInputValues('model');
        var kennzeichen = getInputValues('kennzeichen').toUpperCase();
        var fahrer = getInputValues('fahrer').toLowerCase()
        console.log(fahrer);
        var blp = getInputValues('blp');
        var fklasse = getInputValues('fklasse');
        var zuzahlung = getInputValues('zuzahlung');

        // Save mietwagen to the database
        saveMietwagen(art, uedate, model, kennzeichen, fahrer, blp, fklasse, zuzahlung);
    }

    // Show alert
    document.querySelector('.caralert').style.display = 'block';

    // Hide alert after 3 seconds
    setTimeout(function () {
        document.querySelector('.caralert').style.display = 'none';
    }, 3000);

    // Clear Document after submission
    document.getElementById('carform').reset();

    // Reset the form fields
    resetCarform();

}

// Function to get form values
function getInputValues(id) {
    return document.getElementById(id).value;
}

// Function to get radio values
function getRadioValues() {
    return document.querySelector('input[name="fahrzeugart"]:checked').value;
}

// Save company car and its contract information to firestore
function saveFirmenwagen(art, model, kennzeichen, fahrer, blp, vnummer, zuzahlung, odatum, mileage, cende, cnummer) {
    fahrzeugeRef.doc(kennzeichen).set({
        Fahrzeugart: art,
        Modell: model,
        Kennzeichen: kennzeichen,
        Fahrer: fahrer,
        Bruttolistenpreis: blp + " €",
        Versicherungsnummer: vnummer,
        Zuzahlung: zuzahlung + " €",
        Vertragsbestelldatum: odatum,
        Vertragslaufleistung: mileage + " km",
        Vertragsende: cende,
        Vertragsnummer: cnummer
    });
    mitarbeiterRef.doc(fahrer).update({
        hatFahrzeug: true,
        Kennzeichen: kennzeichen
    })
}

// Save rented car to firestore
function saveMietwagen(art, uedate, model, kennzeichen, fahrer, blp, fklasse, zuzahlung) {
    fahrzeugeRef.doc(kennzeichen).set({
        Fahrzeugart: art,
        Modell: model,
        Kennzeichen: kennzeichen,
        Übergabedatum: uedate,
        Fahrer: fahrer,
        Bruttolistenpreis: blp + " €",
        Fahrzeugklasse: fklasse,
        Zuzahlung: zuzahlung + " €"
    });
    mitarbeiterRef.doc(fahrer).update({
        hatFahrzeug: true,
        Kennzeichen: kennzeichen
    })
}

// reset the fields after successful submission
function resetCarform() {
    document.getElementsByClassName('uedatum')[1].style.visibility = 'hidden';
    document.getElementsByClassName('fklasse')[0].style.display = 'none';
    document.getElementsByClassName('vnummer')[1].style.display = 'block';
    document.getElementsByClassName('vdaten')[0].style.display = 'block';
    document.getElementsByClassName('cnummer')[0].style.display = 'block';
    document.getElementsByClassName('cende')[0].style.display = 'block';
    document.getElementsByClassName('mileage')[0].style.display = 'block';
    document.getElementsByClassName('odatum')[0].style.display = 'block';

}

document.getElementById('workerform').addEventListener('submit', submitWorkerForm);

function submitWorkerForm(e) {

    e.preventDefault();

    var wemail = getInputValues('wemail').toLowerCase();
    var wname = Name(wemail);

    saveMitarbeiter(wemail, wname);

    document.querySelector('.workeralert').style.display = 'block';

    setTimeout(function () {
        document.querySelector('.workeralert').style.display = 'none';
    }, 3000);

    document.getElementById('workerform').reset();
}

function saveMitarbeiter(wemail, wname) {
    mitarbeiterRef.doc(wemail).set({
        AktuellerFuehrerschein: "-1",
        Mail: wemail,
        Name: wname,
        ErfolgreichePruefungDatum: new Date(Date.UTC(2000, 00, 01)),
        hatFahrzeug: false,
        LetzterUpload: "",
        Kennzeichen: ""
    })
}


var licenseRef = db.collection('Fuehrerschein');

var licenseCounter = 1;

var data = null;

var currentGuy = null;

var currentBackUrl = null;

var currentFrontUrl = null;

document.getElementById('license-search').addEventListener('click', searchLicenses);

function searchLicenses() {
    document.getElementById('ablehnung-box').style.display = 'none';
    licenseCounter = 1;
    licenseRef.get().then(function (querySnapshot) {
        data = querySnapshot.docs.map(function (documentSnapshot) {
            return documentSnapshot.data();
        })
        console.log(data.length);
        loadNext();
    })
}

document.getElementById('yesbutton').addEventListener('click', acceptLicense);
document.getElementById('nobutton').addEventListener('click', denyLicense);

function acceptLicense() {
    var currentMitarbeiterID = data[licenseCounter].MitarbeiterID;
    var oldLicenseID = currentGuy.AktuellerFuehrerschein;
    var newLicenseID = String(parseInt(currentGuy.AktuellerFuehrerschein) + 1);
    mitarbeiterRef.doc(currentMitarbeiterID).collection('Fuehrerscheine').doc(newLicenseID).set({
        MitarbeiterID: currentMitarbeiterID,
        URLFront: data[licenseCounter].URLFront,
        URLBack: data[licenseCounter].URLBack,
        Ablaufdatum: data[licenseCounter].Ablaufdatum.toLocaleDateString(),
        Aktuell: true
    })
    if (newLicenseID == "0") {
        mitarbeiterRef.doc(currentMitarbeiterID).update({
            AktuellerFuehrerschein: newLicenseID,
            LetzterUpload: data[licenseCounter].UploadZeitpunkt,
            ErfolgreichePruefungDatum: firebase.firestore.FieldValue.serverTimestamp()
        })
    }
    else {
        mitarbeiterRef.doc(currentMitarbeiterID).update({
            AktuellerFuehrerschein: newLicenseID,
            LetzterUpload: data[licenseCounter].UploadZeitpunkt,
            ErfolgreichePruefungDatum: firebase.firestore.FieldValue.serverTimestamp()
        })
        mitarbeiterRef.doc(currentMitarbeiterID).collection('Fuehrerscheine').doc(oldLicenseID).update({
            Aktuell: false
        })
    }
    deleteLicense(currentMitarbeiterID);

    licenseCounter++;

    loadNext();

    document.querySelector('.licensealert').style.display = 'block';

    setTimeout(function () {
        document.querySelector('.licensealert').style.display = 'none';
    }, 3000);
}

function denyLicense() {
    document.getElementById('ablehnung-box').style.display = 'block';
}

document.getElementById('sendMail').addEventListener('click', sendEmail);

function sendEmail() {
    var empfaenger = data[licenseCounter].MitarbeiterID;
    var betreff = "Ihr Führerschein-Upload in der ndriver App wurde abgelehnt";
    var body = document.getElementById('emailtext').value;

    var mailurl = mailToUrl(empfaenger, betreff, body);

    window.location.href = mailurl;

    document.getElementById('emailtext').value = "";

    deleteLicense(empfaenger);

    licenseCounter++;

    loadNext();

    document.querySelector('.denialalert').style.display = 'block';

    setTimeout(function () {
        document.querySelector('.denialalert').style.display = 'none';
    }, 3000);

    document.getElementById('ablehnung-box').style.display = 'none';
}

function mailToUrl(empfaenger, betreff, body) {
    var args = [];
    args.push('subject=' + encodeURIComponent(betreff));
    args.push('body=' + encodeURIComponent(body));
    var url = 'mailto:' + empfaenger;
    if (args.length > 0) {
        url += '?' + args.join('&');
    }
    return url;
}

function deleteLicense(currentMitarbeiterID) {
    licenseRef.doc(currentMitarbeiterID).delete();
}

function openBack() {
    var win = window.open(currentBackUrl, '_blank');
    win.focus();
}

function openFront() {
    var win2 = window.open(currentFrontUrl, '_blank');
    win2.focus();
}

function loadNext() {
    if (licenseCounter == data.length) {
        document.querySelector('.nothingleftalert').style.display = 'grid';
        document.getElementById('license-box').style.display = 'none';
        return;
    }
    mitarbeiterRef.doc(data[licenseCounter].MitarbeiterID).get().then(function (documentSnapshot) {
        currentGuy = documentSnapshot.data();
    })
    document.querySelector('.nothingleftalert').style.display = 'none';
    document.getElementById('license-box').style.display = 'grid';
    document.querySelector('#license-user').textContent = data[licenseCounter].MitarbeiterID;
    document.querySelector('#license-date').textContent = data[licenseCounter].Ablaufdatum.toLocaleDateString();
    currentBackUrl = data[licenseCounter].URLBack;
    currentFrontUrl = data[licenseCounter].URLFront;
}

//TODO: Ablehnung des Führerscheins behandeln

//gets the InputWindow for the key of the desired Dataset
function getDataMask(Datensatz) {
    fillDatalist(Datensatz, "MAList");
    document.getElementById("keylabel").style.display = "block";
    document.getElementById("keyinput").style.display = "block";
    document.getElementById("keybutton").style.display = "block";
    if (Datensatz == "Mitarbeiter") {
        document.getElementById("keyLabel").innerHTML = "Name";
        document.getElementById("keyinsert").placeholder = "jens.zuo@nterra.com";
    }
    if (Datensatz == "Fahrzeug") {
        document.getElementById("keyLabel").innerHTML = "Kennzeichen";
        document.getElementById("keyinsert").placeholder = "DA NT 100";
    }
}

//opens the Editor-Page
function getEditor(Datensatz, Key) {
    ResetEditor();
    setHash('editor')
    if (Datensatz == "Mitarbeiter") {
        document.getElementById("Mitarbeiter-Edit").style.display = 'block';
        searchDatabase(Key, false);
    }
    if (Datensatz == "Fahrzeug") {
        document.getElementById("Fahrzeug-Edit").style.display = 'block';
        searchDatabase(Key, true);
    }
}

function searchDatabase(key, bool) {
    if (bool) {
        var docRef = fahrzeugeRef.doc(key);
    } else {
        var docRef = mitarbeiterRef.doc(key)
    }
    docRef.get().then(function (doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            FillEditMask(doc, bool, key);
        } else {
            //TODO: User wird benachrichtigt, wenn keine Daten verfügbar sind
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
}

var startdate = new Date(new Date().getFullYear(), 0, 1)
var enddate = new Date(new Date().getFullYear() + 1, 0, 1)

function FillEditMask(doc, bool, key) {
    var data = doc.data();
    document.getElementById('edithistoryid').style.display = 'none';
    document.getElementById('editplaceholder').style.display = 'none';
    document.getElementById('editnummerid').style.display = 'none';
    document.getElementById('edittodatumid').style.display = 'none';
    document.getElementById('editmileageid').style.display = 'none';
    document.getElementById('editcendeid').style.display = 'none';
    document.getElementById('editvnummerid').style.display = 'none';
    document.getElementById('editdatumid').style.display = 'none';
    document.getElementById('editplaceholder').style.display = 'none';
    document.getElementById('editklasseid').style.display = 'none';
    if (bool) {
        document.getElementById('editfahrzeugart').value = data.Fahrzeugart;
        document.getElementById('editkennzeichen').value = data.Kennzeichen;
        document.getElementById('editmodel').value = data.Modell;
        document.getElementById('editfahrer').value = data.Fahrer;
        document.getElementById('editblp').value = data.Bruttolistenpreis;
        document.getElementById('editzuzahlung').value = data.Zuzahlung;
        if (doc.data().Fahrzeugart == "Firmenwagen") {
            document.getElementById('editnummerid').style = 'block';
            document.getElementById('edittodatumid').style = 'block';
            document.getElementById('editmileageid').style = 'block';
            document.getElementById('editcendeid').style = 'block';
            document.getElementById('editvnummerid').style = 'block';
            document.getElementById('editplaceholder').style = 'block';
            document.getElementById('editvnummer').value = data.Versicherungsnummer;
            document.getElementById('editcnummer').value = data.Vertragsnummer;
            document.getElementById('edittodatum').value = data.Vertragsbestelldatum;
            document.getElementById('editmileage').value = data.Vertragslaufleistung;
            document.getElementById('editcende').value = data.Vertragsende;
            if (typeof data.Verlauf !== "undefined"){
                document.getElementById('editplaceholder').style = 'none'; 
                document.getElementById('edithistoryid').style.display = 'block';
                document.getElementById('edithistoryid').value = data.Verlauf;
            }
        } else {
            document.getElementById('editdatumid').style = 'block';
            document.getElementById('editklasseid').style = 'block';
            document.getElementById('edituedatum').value = doc.data().Übergabedatum;
            document.getElementById('editfahrzeugklasse').value = doc.data().Fahrzeugklasse;
            if (typeof data.Verlauf !== "undefined"){
                document.getElementById('editplaceholder').style = 'block'; 
                document.getElementById('edithistoryid').style.display = 'block';
                document.getElementById('edithistory').value = data.Verlauf;
            }
        }
    }

    else {
        var numberdays
        document.getElementById('editname').value = data.Name;
        document.getElementById('editnterraid').value = key;
        mitarbeiterRef.doc(key).collection("Fuehrerscheine").doc(data.AktuellerFuehrerschein).get().then(function (License) {
            if (License.exists) {
                setinner("lastupload", generateURLString(License.data().URLFront, License.data().URLBack));
            } else {
                setinner("lastupload", "keine Uploads");
            }
        getDrives(key);

        })
    }
}

function getDrives(Mitarbeiter) {
    mitarbeiterRef.doc(Mitarbeiter).collection("ImBuero").where("Datum", ">", lastcalendaryear()).get().then(function (Fahrten){
        console.log(Fahrten)
        if (!Fahrten.empty) {
            console.log(Fahrten);
            setinner("Fahrten", "Fahrten ins Büro im letzten Kalenderjahr: " + Fahrten.size)
        } else {
            setinner("Fahrten", "keine Fahrten im letzten Kalenderjahr")
        }
    })
}

function lastcalendaryear() {
    var thisyear
    var lastyear
    
    thisyear = (new Date()).getFullYear();
    lastyear = new Date(thisyear, 0, 1)

    return lastyear
}

async function EditFahrzeug(Key, Fahrzeugart) {
    var olddriver
    var docRef

    docRef = fahrzeugeRef.doc(Key);

    var snapshot = await docRef.get()
    olddriver = Name(snapshot.data().Fahrer);

    if (Fahrzeugart == "Firmenwagen") {
        db.collection('Fahrzeuge').doc(Key).update({
            Fahrzeugart: Fahrzeugart,
            Kennzeichen: Key,
            Modell: document.getElementById('editmodel').value,
            Fahrer: document.getElementById('editfahrer').value,
            Bruttolistenpreis: document.getElementById('editblp').value,
            Versicherungsnummer: document.getElementById('editvnummer').value,
            Zuzahlung: document.getElementById('editzuzahlung').value,
            Vertragsbestelldatum: document.getElementById('edittodatum').value,
            Vertragsende: document.getElementById('editcende').value,
            Vertragslaufleistung: document.getElementById('editmileage').value,
            Vertragsnummer: document.getElementById('editcnummer').value,
        })
            .then(function () {
                document.querySelector('.fahrzeug-changealert').style.display = 'block';

                setTimeout(function () {
                    document.querySelector('.fahrzeug-changealert').style.display = 'none';
                }, 3000);
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                document.getElementById('editfailed').style = 'block'
                console.error("Error writing document: ", error);
            });
    } else {
        docRef.update({
            Fahrzeugart: Fahrzeugart,
            Kennzeichen: Key,
            Modell: document.getElementById('editmodel').value,
            Fahrer: document.getElementById('editfahrer').value,
            Bruttolistenpreis: document.getElementById('editblp').value,
            Versicherungsnummer: document.getElementById('editvnummer').value,
            Zuzahlung: document.getElementById('editzuzahlung').value,
            Übergabedatum: document.getElementById('edituedatum').value,
            Fahrzeugklasse: document.getElementById('editfahrzeugklasse').value
        })
            .then(function () {
                document.querySelector('.fahrzeug-changealert').style.display = 'block';

                setTimeout(function () {
                    document.querySelector('.fahrzeug-changealert').style.display = 'none';
                }, 3000);
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                document.getElementById('editfailed').style = 'block'
                console.error("Error writing document: ", error);
            });
    }

    if (document.getElementById('editfahrer').value !== olddriver) {
        if (typeof snapshot.data().Verlauf !== "undefined") {
            docRef.update({
                Verlauf: snapshot.data().Verlauf + "; " + olddriver
            })
        } else {

            docRef.set({
                Verlauf: olddriver
            }, { merge: true });
        }
    }
}

function EditMitarbeiter(Key) {
    db.collection('Mitarbeiter').doc(Key).update({
        Name: document.getElementById('editname').value,
    })
        .then(function () {
            document.querySelector('.mitarbeiter-changealert').style.display = 'block';

            setTimeout(function () {
                document.querySelector('.mitarbeiter-changealert').style.display = 'none';
            }, 3000);
            console.log("Document successfully written!");
        })
        .catch(function (error) {
            document.getElementById('editfailed').style = 'block'
            console.error("Error writing document: ", error);
        });
}

//Fehlt: Nachricht erfolgreich
function DeleteData(Art, Key) {
    if (Art == "Fahrzeug") {
        fahrzeugeRef.doc(Key).delete().then(function () {
            document.querySelector('.fahrzeug-deletealert').style.display = 'block';

            setTimeout(function () {
                document.querySelector('.fahrzeug-deletealert').style.display = 'none';
            }, 3000);
            console.log("Document successfully deleted!");
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    }

    if (Art == "Mitarbeiter") {
        if (typeof mitarbeiterRef.doc(Key).collection("ImBuero") !== "undefined") {
            deleteCollection(mitarbeiterRef.doc(Key).collection("ImBuero"));
        }

        if (typeof mitarbeiterRef.doc(Key).collection("Fuehrerscheine") !== "undefined") {
            deleteCollection(mitarbeiterRef.doc(Key).collection("Fuehrerscheine"));
        }

        if (typeof db.collection("Fuehrerschein").doc(Key) !== "undefined") {
            db.collection("Fuehrerschein").doc(Key).delete();
        }

        mitarbeiterRef.doc(Key).delete().then(function () {
            document.querySelector('.mitarbeiter-deletealert').style.display = 'block';

            setTimeout(function () {
                document.querySelector('.mitarbeiter-deletealert').style.display = 'none';
            }, 3000);
            console.log("Document successfully deleted!");
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    }
}

//Aufruf wenn die Editor Page aufgerufen wird, resettet Forms und Divisions
function ResetEditor() {
    document.getElementById("Mitarbeiter-Edit").style.display = 'none';
    document.getElementById("Fahrzeug-Edit").style.display = 'none';
}

async function getMa() {
    const snapshot = await firebase.firestore().collection('Mitarbeiter').get();
    return snapshot.docs.map(doc => doc.data().Mail);
}

//alle Mails aus allen Documents
async function getMaNew() {

    var DatumArray = new Array();
    var MitarbeiterArray = new Array();

    const snapshot = await mitarbeiterRef.orderBy("LetzterUpload", "asc").get();
    snapshot.forEach(function(doc) {
        MitarbeiterArray.push(doc.data().Mail);
        if (doc.data().LetzterUpload !== "") {
        DatumArray.push(doc.data().LetzterUpload.toLocaleDateString())
        } else {
        DatumArray.push("")
        }

    });


    var gesamtArray = Array(DatumArray, MitarbeiterArray);

    return gesamtArray

}

//alle Kennzeichen der Fahrzeuge
async function getKennzeichen() {
    const snapshot = await firebase.firestore().collection('Fahrzeuge').get();
    return snapshot.docs.map(doc => doc.data().Kennzeichen);
}

//Füllt Datalists der Inputfelder, mit denen dann das Dropdown generiert wird
function fillDatalist(Typ, List) {
    var myMa = new Array();
    var options = '';

    if (Typ == "Mitarbeiter") {
        getMa().then(function (result) {

            for (var i = 0; i < result.length; i++)
                options += '<option value="' + result[i] + '" />';

            document.getElementById(List).innerHTML = options;
        })
    } else {
        getKennzeichen().then(function (result) {

            for (var i = 0; i < result.length; i++)
                options += '<option value="' + result[i] + '" />';

            document.getElementById(List).innerHTML = options;
        })
    }
}


//ordnet jedem Mitarbeiter sein Auto zu, falls vorhanden
//funktioniert bisher nur für 0-1 Auto pro Person
function getMAcars(Employees) {

    Employees[1].forEach(function(employee){
        fahrzeugeRef.where("Fahrer", "==", employee).get().then(function(cars){
            if (!cars.empty) {
                cars.forEach(car => {
                    Employees[2].push(car.data().Kennzeichen);
                })
            } else {
                Employees[2].push("")
            }
        })})

    return new Promise(function(resolve){
        resolve(Employees)
    })

}

function newMaTable(Mitarbeiter, innerString) {
    innerString += '<td><button class="link" onclick="getEditor(`Mitarbeiter`, `' + Mitarbeiter +
        '`)">' + Name(Mitarbeiter) + '</button></td>';
    return innerString;
}

function newCarTable(Car, innerString) {
    innerString += '<td><button class="link" onclick="getEditor(`Fahrzeug`, `' + Car +
        '`)">' + Car + '</button></td>';
    return innerString;
}

function newDateTable(LicenseDate, innerString) {
    innerString += '<td>' + LicenseDate + '</td>';
    return innerString;
}


//Generiert automatisch die Tabelle mit den dazugehörigen Mitarbeitern und deren Autos
async function GenerateTable() {
    var Employees = new Array()
    var Cars = new Array()
    var innerstring = '<tr><th>Mitarbeiter</th><th>Fahrzeug</th></tr>'

    getMa().then(function (Mitarbeiter) {
        Mitarbeiter.map(mail => Employees.push(mail))
    });

    const snapshot = await getMAcars()
    Cars = snapshot;

    console.log(Cars)
    console.log(Employees)

    await getMa();

    for (var i = 0; i < Employees.length; i++) {
        innerstring += "<tr>"
        innerstring = newMaTable(Employees[i], innerstring)
        if (Cars[i] !== "placeholder") {
            innerstring = newCarTable(Cars[i], innerstring)
        } else {
            innerstring += '<td></td>'
        }
        innerstring += "</tr>"
    }

    document.getElementById("Employee-Car").innerHTML = innerstring;
}

function Name(str) {

    str = str.replace(".", " ");
    str = str.replace("@nterra.com", "");
    str = str.replace(/\b\w/g, l => l.toUpperCase());

    return str
}

async function newMAtest(){
    var Employees = new Array(Array(), Array(), Array())

    snapshot = await mitarbeiterRef.orderBy("LetzterUpload", "asc").get()
        snapshot.forEach(function(doc) {
            Employees[1].push(doc.data().Mail);
            if (doc.data().LetzterUpload !== "") {
            Employees[0].push(doc.data().LetzterUpload.toLocaleDateString())
            } else {
            Employees[0].push("")
            }
            Employees[2].push(doc.data().Kennzeichen)
        })

        return Employees

}



async function GenerateTableNew() {
    var innerstring = '<tr><th>Mitarbeiter</th><th>Fahrzeug</th><th>Letzter Check</th></tr>'
    
    const result = await newMAtest()

    console.log(result)

    for (var i = 0; i < result[1].length; i++) {
        innerstring += "<tr>"
        innerstring = newMaTable(result[1][i], innerstring)
        innerstring = newCarTable(result[2][i], innerstring)
        innerstring = newDateTable(result[0][i], innerstring)
        innerstring += "</tr>"
    }

    document.getElementById("Employee-Car").innerHTML = innerstring;

}

function Name(str) {

    str = str.replace(".", " ");
    str = str.replace("@nterra.com", "");
    str = str.replace(/\b\w/g, l => l.toUpperCase());

    return str
}


function setinner(id, innerstring) {
    document.getElementById(id).innerHTML = innerstring;
}

function generateURLString(URLFront, URLBack) {
    var innerstring

    innerstring = "<label>Aktueller Upload:</label><a href='" + URLFront + "'target='_blank'>Vorderseite</a><br /><a href='" + URLBack + "'target='_blank'>Rückseite</a>";
    return innerstring;
}

//deletes 
function deleteCollection(collection) {

    collection.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {

            collection.doc(doc.id).delete().then(function () {
                console.log("Document successfully deleted!");
            }).catch(function (error) {
                console.error("Error removing document: ", error);
            });

        });
    });
}


async function exportCars(bool, tableid) {

    var snapshot
    var exportstring

    getMaNew();

    if (bool) {
        snapshot = await fahrzeugeRef.orderBy("Vertragsende", "asc").get();
        exportstring = "<tr><th>Kennzeichen</th><th>aktueller Fahrer</th><th>Modell</th><th>Zuzahlung</th><th>BLP</th><th>Laufleistung</th>" +
            "<th>Vertragsende</th><th>Vertrag Nr.</th><th>KFZ Versicherungsnummer</th></tr>";
    } else {
        snapshot = await fahrzeugeRef.get();
        exportstring = "<tr><th>Kennzeichen</th><th>aktueller Fahrer</th><th>Modell</th><th>Zuzahlung</th>" +
            "<th>BLP</th><th>Fahrzeugklasse</th><th>Übergabedatum</th></tr>";
    }

    snapshot.forEach(function (doc) {

        var data = doc.data();

        exportstring += "<tr>";

        if (bool) {
            if (data.Fahrzeugart == "Firmenwagen") {
                exportstring = newCarTable(data.Kennzeichen, exportstring);
                exportstring = newMaTable(data.Fahrer, exportstring);
                exportstring = newcol(exportstring, data.Modell);
                exportstring = newcol(exportstring, data.Zuzahlung);
                exportstring = newcol(exportstring, data.Bruttolistenpreis);
                exportstring = newcol(exportstring, data.Vertragslaufleistung);
                exportstring = newcol(exportstring, data.Vertragsende);
                exportstring = newcol(exportstring, data.Vertragsnummer);
                exportstring = newcol(exportstring, data.Versicherungsnummer);
            }
        } else {
            if (data.Fahrzeugart == "Mietwagen") {
                exportstring = newCarTable(data.Kennzeichen, exportstring);
                exportstring = newMaTable(data.Fahrer, exportstring);
                exportstring = newcol(exportstring, data.Modell);
                exportstring = newcol(exportstring, data.Zuzahlung);
                exportstring = newcol(exportstring, data.Bruttolistenpreis);
                exportstring = newcol(exportstring, data.Fahrzeugklasse);
                exportstring = newcol(exportstring, data.Übergabedatum);
            }
        }

        exportstring += "</tr>";

    })

    setinner(tableid, exportstring);

}

function newcol(exportstring, datastring) {
    var newstring = exportstring + "<td>" + datastring + "</td>";

    return newstring;
}



initFirebaseAuth();