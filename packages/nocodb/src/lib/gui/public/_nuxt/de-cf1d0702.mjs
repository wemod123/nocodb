const general = {
  home: "Start",
  load: "Laden",
  open: "\xD6ffnen",
  close: "Schlie\xDFen",
  yes: "Ja",
  no: "Nein",
  ok: "OK",
  and: "Und",
  or: "Oder",
  add: "Hinzuf\xFCgen",
  edit: "Bearbeiten",
  remove: "Entfernen",
  save: "Speichern",
  cancel: "Abbrechen",
  submit: "\xDCbertragen",
  create: "Erstellen",
  insert: "Einf\xFCgen",
  "delete": "L\xF6schen",
  update: "Aktualisieren",
  rename: "Umbenennen",
  reload: "Neu laden",
  reset: "Zur\xFCcksetzen",
  install: "Installieren",
  show: "Anzeigen",
  hide: "Verstecken",
  showAll: "Alles anzeigen",
  hideAll: "Alles verstecken",
  showMore: "Mehr anzeigen",
  showOptions: "Optionen einblenden",
  hideOptions: "Optionen ausblenden",
  showMenu: "Men\xFC einblenden",
  hideMenu: "Men\xFC ausblenden",
  addAll: "Alles hinzuf\xFCgen",
  removeAll: "Alles entfernen",
  signUp: "Anmelden",
  signIn: "Einloggen",
  signOut: "Ausloggen",
  required: "Erforderlich",
  preferred: "Bevorzugt",
  mandatory: "Verpflichtend",
  loading: "Wird geladen ...",
  title: "Titel",
  upload: "Hochladen",
  download: "Herunterladen",
  "default": "Standard",
  more: "Mehr",
  less: "Weniger",
  event: "Ereignis",
  condition: "Bedingung",
  after: "Nach dem",
  before: "Vor",
  search: "Suche",
  notification: "Benachrichtigung",
  reference: "Referenz",
  "function": "Funktion"
};
const objects = {
  project: "Projekt",
  projects: "Projekte",
  table: "Tabelle",
  tables: "Tabellen",
  field: "Feld",
  fields: "Felder",
  column: "Spalte",
  columns: "Spalten",
  page: "Seite",
  pages: "Seiten",
  record: "Aufzeichnen",
  records: "Aufzeichnungen",
  webhook: "Webhook",
  webhooks: "Webhooks",
  view: "Ansicht",
  views: "Ansichten",
  viewType: {
    grid: "Gitter",
    gallery: "Galerie",
    form: "Formular",
    kanban: "Kanban",
    calendar: "Kalender"
  },
  user: "Nutzer",
  users: "Benutzer",
  role: "Rolle",
  roles: "Rollen",
  roleType: {
    owner: "Eigent\xFCmer",
    creator: "Ersteller",
    editor: "Bearbeiter",
    commenter: "Kommentator",
    viewer: "Zuschauer"
  }
};
const datatype = {
  ID: "ID",
  ForeignKey: "Unbekannter Schl\xFCssel",
  SingleLineText: "Einzeiliger Text",
  LongText: "Langer Text",
  Attachment: "Anhang",
  Checkbox: "Kontrollk\xE4stchen",
  MultiSelect: "Mehrfachauswahl",
  SingleSelect: "Einfache Auswahl",
  Collaborator: "Mitarbeiter",
  "Date": "Datum",
  Year: "Jahr",
  Time: "Zeit",
  PhoneNumber: "Telefonnummer",
  Email: "Email",
  URL: "URL",
  "Number": "Nummer",
  Decimal: "Dezimal",
  Currency: "W\xE4hrung",
  Percent: "Prozent",
  Duration: "Dauer",
  Rating: "Klassifizierung",
  Formula: "Formel",
  Rollup: "Rollup",
  Count: "Z\xE4hlen",
  Lookup: "Nachschlagen",
  DateTime: "Datum/Zeit",
  CreateTime: "Zeit erstellen",
  LastModifiedTime: "Zuletzt bearbeitet",
  AutoNumber: "Auto-Nummerierung",
  Barcode: "Barcode",
  Button: "Taste",
  Password: "Passwort",
  relationProperties: {
    noAction: "Keine Aktion",
    cascade: "Kaskade",
    restrict: "Beschr\xE4nken",
    setNull: "Auf Null setzen",
    setDefault: "Auf Standard setzen"
  }
};
const filterOperation = {
  isEqual: "ist gleich",
  isNotEqual: "ist nicht gleich",
  isLike: "ist wie",
  "isNot like": "ist nicht wie",
  isEmpty: "ist leer",
  isNotEmpty: "ist nicht leer",
  isNull: "ist Null",
  isNotNull: "ist nicht Null"
};
const title = {
  newProj: "Neues Projekt",
  myProject: "Meine Projekte",
  formTitle: "Formular Titel",
  collabView: "Mitarbeiteransicht",
  lockedView: "Gesperrte Ansicht",
  personalView: "Pers\xF6nliche Ansicht",
  appStore: "App-Store",
  teamAndAuth: "Team & Auth",
  rolesUserMgmt: "Rollen- & Benutzermanagement",
  userMgmt: "Benutzermanagement",
  apiTokenMgmt: "API-Tokens-Management",
  rolesMgmt: "Rollenmanagement",
  projMeta: "Projektmetadaten",
  metaMgmt: "Meta-Management",
  metadata: "Metadaten",
  exportImportMeta: "Metadaten exportieren / importieren",
  uiACL: "UI-Zugangskontrolle",
  metaOperations: "Metadatenoperationen",
  audit: "Audit",
  auditLogs: "Audit-Log",
  sqlMigrations: "SQL-Migrationen",
  dbCredentials: "Datenbank-Anmeldeinformationen",
  advancedParameters: "SSL & Erweiterte Parameter",
  headCreateProject: "Projekt erstellen | NocoDB",
  headLogin: "Anmelden | NocoDB",
  resetPassword: "Passwort zur\xFCcksetzen",
  teamAndSettings: "Team & Settings",
  apiDocs: "API Docs",
  importFromAirtable: "Import aus Airtable"
};
const labels = {
  notifyVia: "Benachrichtigen mit",
  projName: "Projektname",
  tableName: "Tabellenname",
  viewName: "Namen anzeigen",
  viewLink: "Link anzeigen",
  columnName: "Spaltenname",
  columnType: "Spaltentyp",
  roleName: "Rollenname",
  roleDescription: "Rollenbeschreibung",
  databaseType: "Typ in der Datenbank",
  lengthValue: "L\xE4nge / Wert",
  dbType: "Datenbanktyp",
  sqliteFile: "SQLite-Datei",
  hostAddress: "Host-Adresse",
  port: "Port-Nummer",
  username: "Benutzername",
  password: "Passwort",
  schemaName: "Name des Schemas",
  action: "Aktion",
  actions: "Aktionen",
  operation: "Vorgang",
  operationType: "Vorgangstyp",
  operationSubType: "Vorgangsuntertyp",
  description: "Beschreibung",
  authentication: "Authentifizierung",
  token: "Token",
  where: "Wo",
  cache: "Zwischenspeicher",
  chat: "Chat",
  email: "Email",
  storage: "Speicher",
  uiAcl: "UI-ACL",
  models: "Modelle",
  syncState: "Sync-Status",
  created: "Erstellt",
  sqlOutput: "SQL-Ausgabe",
  addOption: "Option hinzuf\xFCgen",
  aggregateFunction: "Globale Funktion",
  dbCreateIfNotExists: "Datenbank: Erstellen, falls nicht vorhanden",
  clientKey: "Client-Schl\xFCssel",
  clientCert: "Client Cert",
  serverCA: "Server CA",
  requriedCa: "Erforderliches CA",
  requriedIdentity: "Erforderliche Identit\xE4t",
  inflection: {
    tableName: "Flexion - Tabellenname",
    columnName: "Flexion - Spaltenname"
  },
  community: {
    starUs1: "Stern",
    starUs2: "uns auf Github",
    bookDemo: "Eine kostenlose Demo buchen",
    getAnswered: "Erhalten Sie Antworten auf Ihre Fragen",
    joinDiscord: "Discord beitreten",
    joinCommunity: "NocoDB Community beitreten",
    joinReddit: "/r/NocoDB beitreten",
    followNocodb: "Folgen Sie NocoDB"
  },
  docReference: "Dokumentenverweis",
  selectUserRole: "Benutzerrolle ausw\xE4hlen",
  childTable: "Child-Tabelle",
  childColumn: "Child-Spalte",
  onUpdate: "Update",
  onDelete: "L\xF6schen"
};
const activity = {
  createProject: "Projekt erstellen",
  importProject: "Projekt importieren",
  searchProject: "Projekt suchen",
  editProject: "Projekt bearbeiten",
  stopProject: "Projekt stoppen",
  startProject: "Projekt starten",
  restartProject: "Projekt neu starten",
  deleteProject: "Projekt l\xF6schen",
  refreshProject: "Projekte aktualisieren",
  saveProject: "Projekt speichern",
  createProjectExtended: {
    extDB: "Erstellen durch Verbinden <br>mit einer externen Datenbank",
    excel: "Projekt aus Excel erstellen",
    template: "Projekt aus Vorlage erstellen"
  },
  OkSaveProject: "OK & Projekt speichern",
  upgrade: {
    available: "Upgrade verf\xFCgbar",
    releaseNote: "Versionshinweise",
    howTo: "Wie wird aktualisiert?"
  },
  translate: "\xDCbersetzen helfen",
  account: {
    authToken: "Auth-Token kopieren",
    swagger: "Swagger Apis Doc",
    projInfo: "Projektinfo kopieren",
    themes: "Themen"
  },
  sort: "Sortieren",
  addSort: "Sortieroption hinzuf\xFCgen",
  filter: "Filter",
  addFilter: "Filter hinzuf\xFCgen",
  share: "Teilen",
  shareBase: {
    disable: "Freigegebene Datenbank deaktivieren",
    enable: "Jeder mit dem Link",
    link: "Freigegebene Datenbank-Link"
  },
  invite: "Einladen",
  inviteMore: "Mehr einladen",
  inviteTeam: "Team einladen",
  inviteToken: "Token einladen",
  newUser: "Neuer Benutzer",
  editUser: "Benutzer bearbeiten",
  deleteUser: "Benutzer vom Projekt entfernen",
  resendInvite: "Einladungs-Email erneut versenden",
  copyInviteURL: "Einladungs-URL kopieren",
  newRole: "Neue Rolle",
  reloadRoles: "Rollen neu laden",
  nextPage: "N\xE4chste Seite",
  prevPage: "Vorherige Seite",
  nextRecord: "N\xE4chster Eintrag",
  previousRecord: "Vorheriger Eintrag",
  copyApiURL: "API-URL kopieren",
  createTable: "Tabelle erstellen",
  refreshTable: "Tabellen aktualisieren",
  renameTable: "Tabelle umbenennen",
  deleteTable: "Tabelle l\xF6schen",
  addField: "Neues Feld zu dieser Tabelle hinzuf\xFCgen",
  setPrimary: "Als Prim\xE4rwert festlegen",
  addRow: "Neue Zeile hinzuf\xFCgen",
  saveRow: "Zeile speichern",
  insertRow: "Neue Zeile einf\xFCgen",
  deleteRow: "Zeile l\xF6schen",
  deleteSelectedRow: "Ausgew\xE4hlte Zeilen l\xF6schen",
  importExcel: "Import Excel",
  importCSV: "Import CSV",
  downloadCSV: "Download als CSV",
  downloadExcel: "Download als XLSX",
  uploadCSV: "Hochladen CSV",
  "import": "Importieren",
  importMetadata: "Metadaten importieren",
  exportMetadata: "Metadaten exportieren",
  clearMetadata: "Metadaten l\xF6schen",
  exportToFile: "Export in Datei",
  changePwd: "Kennwort \xE4ndern",
  createView: "Ansicht erstellen",
  shareView: "Ansicht teilen",
  listSharedView: "Geteilte Ansichtenliste",
  ListView: "Ansichtenliste",
  copyView: "Ansicht kopieren",
  renameView: "Ansicht umbenennen",
  deleteView: "Ansicht l\xF6schen",
  createGrid: "Gitter-Ansicht erstellen",
  createGallery: "Galerie-Ansicht erstellen",
  createCalendar: "Kalender-Ansicht erstellen",
  createKanban: "Kanban-Ansicht erstellen",
  createForm: "Formular-Ansicht erstellen",
  showSystemFields: "Systemfelder anzeigen",
  copyUrl: "URL kopieren",
  openTab: "Neue Registerkarte \xF6ffnen",
  iFrame: "Eingebetteten HTML-Code kopieren",
  addWebhook: "Neuen Webhook hinzuf\xFCgen",
  newToken: "Neuen Token hinzuf\xFCgen",
  exportZip: "Zip-Datei exportieren",
  importZip: "Zip-Datei importieren",
  metaSync: "Jetzt synchronisieren",
  settings: "Einstellungen",
  previewAs: "Vorschau anzeigen als",
  resetReview: "Vorschau zur\xFCcksetzen",
  testDbConn: "Datenbankverbindung testen",
  removeDbFromEnv: "Datenbank aus der Umgebung entfernen",
  editConnJson: "Verbindung JSON bearbeiten",
  sponsorUs: "Sponsor uns",
  sendEmail: "E-MAIL SENDEN"
};
const tooltip = {
  saveChanges: "\xC4nderungen speichern",
  xcDB: "Neues Projekt erstellen",
  extDB: "Unterst\xFCtzt MySQL, PostgreSQL, SQL Server & SQLite",
  apiRest: "Zug\xE4nglich \xFCber Rest APIs",
  apiGQL: "Zug\xE4nglich \xFCber Graphql-APIs",
  theme: {
    dark: "Es kommt in Schwarz (^ \u21E7b)",
    light: "Kommt es in schwarz? (^ \u21E7b)"
  },
  addTable: "Neue Tabelle hinzuf\xFCgen",
  inviteMore: "Mehr Benutzer einladen",
  toggleNavDraw: "Navigationsbereich umschalten",
  reloadApiToken: "API-Token neu laden",
  generateNewApiToken: "Neuen API-Token generieren",
  addRole: "Neue Rolle hinzuf\xFCgen",
  reloadList: "Liste neu laden",
  metaSync: "Metadaten synchronisieren",
  sqlMigration: "Migrationen neu laden",
  updateRestart: "Update & Neustart",
  cancelReturn: "Abbrechen und Zur\xFCck",
  exportMetadata: "Alle Metadaten von Metatabellen in Meta-Verzeichnis exportieren.",
  importMetadata: "Alle Metadaten vom Meta-Verzeichnis in Metatabellen importieren.",
  clearMetadata: "Alle Metadaten aus Meta-Tabellen l\xF6schen.",
  clientKey: "Auswahl .key-Datei",
  clientCert: "Auswahl .cert-Datei",
  clientCA: "Auswahl CA-Datei"
};
const placeholder = {
  projName: "Projektnamen eingeben",
  password: {
    enter: "Passwort eingeben",
    current: "Aktuelles Passwort",
    "new": "Neues Passwort",
    save: "Passwort speichern",
    confirm: "Neues Passwort best\xE4tigen"
  },
  searchProjectTree: "Tabellen suchen",
  searchFields: "Felder suchen",
  searchColumn: "Spalten suchen {search}",
  searchApps: "Apps suchen",
  searchModels: "Modelle suchen",
  noItemsFound: "Keine Elemente gefunden",
  defaultValue: "Standardwert",
  filterByEmail: "Filtern nach E-Mail"
};
const msg = {
  info: {
    footerInfo: "Zeilen pro Seite",
    upload: "Datei zum Hochladen ausw\xE4hlen",
    upload_sub: "oder Drag & Drop Datei",
    excelSupport: "Unterst\xFCtzt: .xls ,.xlsx ,.xlsm, .ods, .ots",
    excelURL: "Excel-Datei-URL eingeben",
    csvURL: "CSV-Datei-URL eingeben",
    footMsg: "Anzahl der Zeilen, um den Datentyp analysieren zu k\xF6nnen",
    excelImport: "Blatt/Bl\xE4tter stehen f\xFCr den Import zur Verf\xFCgung",
    exportMetadata: "M\xF6chten Sie Metadaten von Meta-Tabellen exportieren?",
    importMetadata: "M\xF6chten Sie Metadaten von Metatabellen importieren?",
    clearMetadata: "M\xF6chten Sie Metadaten von Meta-Tabellen l\xF6schen?",
    projectEmptyMessage: "Mit dem Erstellen eines neuen Projektes beginnen",
    stopProject: "M\xF6chten Sie das Projekt beenden?",
    startProject: "M\xF6chten Sie das Projekt starten?",
    restartProject: "M\xF6chten Sie das Projekt neu starten?",
    deleteProject: "M\xF6chten Sie das Projekt l\xF6schen?",
    shareBasePrivate: "\xD6ffentlich freigegebene Nur-Lese-Datenbank generieren",
    shareBasePublic: "F\xFCr Jeden im Internet mit diesem Link sichtbar",
    userInviteNoSMTP: "Es sieht so aus, als h\xE4tten Sie den Mailer noch nicht konfiguriert! \\ n Bitte kopieren Sie den obigen Einladungs-Link und senden Sie ihn an",
    dragDropHide: "Ziehen Sie die Felder hierher, um sie zu verstecken",
    formInput: "Formularbezeichnung eingeben",
    formHelpText: "Einen Hilfs-Text hinzuf\xFCgen",
    onlyCreator: "Nur f\xFCr den Ersteller sichtbar",
    formDesc: "Formularbeschreibung hinzuf\xFCgen",
    beforeEnablePwd: "Den Zugriff mit einem Passwort einschr\xE4nken",
    afterEnablePwd: "Zugriff ist Passwort-gesch\xFCtzt",
    privateLink: "Diese Ansicht wird durch einen pers\xF6nlichen Link geteilt",
    privateLinkAdditionalInfo: "Personen mit einem pers\xF6nlichen Link k\xF6nnen nur Zellen sehen, die in dieser Ansicht angezeigt werden",
    afterFormSubmitted: "Nachdem das Formular \xFCbermittelt wurde",
    apiOptions: "Zugriff auf das Projekt via",
    submitAnotherForm: "Weiteres Formular \xFCbermitteln'-Button anzeigen",
    showBlankForm: "Ein leeres Formular nach 5 Sekunden anzeigen",
    emailForm: "E-Mail an mich unter",
    showSysFields: "Systemfelder anzeigen",
    filterAutoApply: "Automatisch anwenden",
    showMessage: "Diese Nachricht anzeigen",
    viewNotShared: "Aktuelle Ansicht wird nicht geteilt!",
    showAllViews: "Alle geteilten Ansichten dieser Tabelle anzeigen",
    collabView: "Mitarbeitern mit Bearbeitungsberechtigung oder h\xF6her k\xF6nnen die Ansichtenkonfiguration \xE4ndern",
    lockedView: "Niemand kann die Ansichtenkonfiguration bearbeiten, bis sie freigeschaltet ist.",
    personalView: "Nur Sie k\xF6nnen die Ansichtenkonfiguration bearbeiten. Weitere Mitarbeiter-Ansichten sind standardm\xE4\xDFig ausgeblendet.",
    ownerDesc: "Kann Ersteller hinzuf\xFCgen / entfernen und Datenbankstrukturen und -felder voll bearbeiten.",
    creatorDesc: "Kann Datenbankstrukturen und Werte vollst\xE4ndig bearbeiten.",
    editorDesc: "Kann Datens\xE4tze bearbeiten, aber die Struktur von Datenbanken / Feldern nicht \xE4ndern.",
    commenterDesc: "Kann die Datens\xE4tze anzeigen und kommentieren, aber nicht bearbeiten",
    viewerDesc: "Kann die Eintr\xE4ge anzeigen, aber nicht bearbeiten",
    addUser: "Neuen Benutzer hinzuf\xFCgen",
    staticRoleInfo: "Systemdefinierte Rollen k\xF6nnen nicht bearbeitet werden",
    exportZip: "Projekt-Meta in ZIP-Datei exportieren und downloaden",
    importZip: "Projekt Meta-ZIP-Datei importieren und neu starten.",
    importText: "Importieren von NocoDB-Projekt durch Hochladen von Metadaten-ZIP-Datei",
    metaNoChange: "Keine \xC4nderung identifiziert",
    sqlMigration: "Schemen-Migrationen werden automatisch erstellt. Tabelle erstellen und diese Seite aktualisieren.",
    dbConnectionStatus: "Umgebung validiert",
    dbConnected: "Verbindung war erfolgreich",
    notifications: {
      no_new: "Keine neuen Benachrichtigungen",
      clear: "Leeren"
    },
    sponsor: {
      header: "Sie k\xF6nnen uns helfen!",
      message: "Wir sind ein winziges Team, welches Vollzeit arbeitet, um NocoDB Open-Source zu machen. Wir glauben, da\xDF ein Werkzeug wie NocoDB f\xFCr jeden Probleml\xF6ser im Internet frei verf\xFCgbar sein sollte."
    },
    loginMsg: "In NocoDB einloggen",
    passwordRecovery: {
      message_1: "Bitte geben Sie die E-Mail-Adresse an, die Sie bei der Anmeldung verwendet haben.",
      message_2: "Wir senden Ihnen eine E-Mail mit einem Link, um das Passwort zur\xFCckzusetzen.",
      success: "Bitte \xFCberpr\xFCfen Sie Ihre E-Mail, um das Passwort zur\xFCckzusetzen"
    },
    signUp: {
      superAdmin: 'Sie werden der "Super Admin" sein',
      alreadyHaveAccount: "Sie haben bereits ein Konto ?",
      workEmail: "Geben Sie Ihre Arbeits-E-Mail ein",
      enterPassword: "Geben Sie Ihr Passwort ein",
      forgotPassword: "Passwort vergessen ?",
      dontHaveAccount: "Sie haben kein Konto?"
    },
    addView: {
      grid: "Gitter-Ansicht hinzuf\xFCgen",
      gallery: "Galerie-Ansicht hinzuf\xFCgen",
      form: "Formular-Ansicht hinzuf\xFCgen",
      kanban: "Kanban-Ansicht hinzuf\xFCgen",
      calendar: "Kalender-Ansicht hinzuf\xFCgen"
    },
    tablesMetadataInSync: "Tabellen-Metadaten sind synchron",
    addMultipleUsers: "Sie k\xF6nnen mehrere kommagetrennte (,) E-Mails hinzuf\xFCgen",
    enterTableName: "Geben Sie den Tabellennamen ein",
    addDefaultColumns: "Standardspalten hinzuf\xFCgen",
    tableNameInDb: "Tabellenname wie in der Datenbank gespeichert"
  },
  error: {
    searchProject: "Ihre Suche nach {search} fand keine Ergebnisse",
    invalidChar: "Ung\xFCltiges Zeichen im Ordnerpfad.",
    invalidDbCredentials: "Ung\xFCltige Datenbankanmeldeinformationen.",
    unableToConnectToDb: "Es kann keine Verbindung zur Datenbank hergestellt werden, bitte \xFCberpr\xFCfen Sie Ihre Datenbank.",
    userDoesntHaveSufficientPermission: "Den Benutzer gibt es nicht oder er hat keine ausreichenden Rechte, um das Schema zu erstellen.",
    dbConnectionStatus: "Ung\xFCltige Datenbankparameter",
    dbConnectionFailed: "Verbindungsfehler:",
    signUpRules: {
      emailReqd: "E-Mail ist erforderlich",
      emailInvalid: "Email mu\xDF g\xFCltig sein",
      passwdRequired: "Passwort ist erforderlich",
      passwdLength: "Ihr Passwort mu\xDF mindestens 8 Zeichen haben"
    }
  },
  toast: {
    exportMetadata: "Projektmetadaten erfolgreich exportiert",
    importMetadata: "Projektmetadaten erfolgreich importiert",
    clearMetadata: "Projektmetadaten erfolgreich gel\xF6scht",
    stopProject: "Projekt wurde erfolgreich gestoppt",
    startProject: "Projekt erfolgreich gestartet",
    restartProject: "Projekt neu gestartet",
    deleteProject: "Projekt erfolgreich gel\xF6scht",
    authToken: "Auth-Token in die Zwischenablage kopiert",
    projInfo: "Projektinformationen in die Zwischenablage kopiert",
    inviteUrlCopy: "Einladungs-URL in die Zwischenablage kopiert",
    createView: "Ansicht erfolgreich erstellt",
    formEmailSMTP: "Bitte aktivieren Sie das SMTP-Plug-In im App-Store, um die E-Mail-Benachrichtigung zu aktivieren",
    collabView: "Erfolgreich auf die kollaborative Ansicht gewechselt",
    lockedView: "Erfolgreich auf gesperrte Ansicht gewechselt",
    futureRelease: "Kommt bald!"
  }
};
var de = {
  general,
  objects,
  datatype,
  filterOperation,
  title,
  labels,
  activity,
  tooltip,
  placeholder,
  msg
};
export { activity, datatype, de as default, filterOperation, general, labels, msg, objects, placeholder, title, tooltip };