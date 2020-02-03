const express = require('express')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const cors = require('cors')
const bodyParser = require('body-parser')
const serveStatic = require('serve-static')
const { passport } = require('./routes/_combinedAuth')
const { IS_PROD, SESSION_SECRET } = require('./utils/const')
const app = express()

const ORIGIN_WHITELIST_ENABLED = false
const ORIGIN_WHITELIST = []
const BODYPARSER_EXCLUDES = ['/webhook']

// TODO: Restrict this more? See: https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', true)

app.use(
  session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false, // TODO: testing
      sameSite: 'none', // TODO: Lax for prod?
      secure: IS_PROD
    },
    store: new MemoryStore({
      checkPeriod: 3600000 // 1 hr
    })
  })
)

// Custom middleware to exclude some specific endpoints from the JSON bodyParser
const jsonBodyParser = bodyParser.json()
app.use((req, res, next) => {
  if (BODYPARSER_EXCLUDES.includes(req.originalUrl)) return next()
  return jsonBodyParser(req, res, next)
})

app.use(passport.initialize())
app.use(passport.session())
app.use(
  cors({
    origin: (origin, cb) => {
      if (ORIGIN_WHITELIST_ENABLED && !ORIGIN_WHITELIST.includes(origin)) {
        cb(new Error('Not allowed by CORS'))
      }
      cb(null, origin || '*')
    },
    credentials: true
  })
)
app.use(serveStatic(`${__dirname}/public`))

// Error handler (needs 4 arg signature apparently)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    error: {
      name: err.name,
      message: err.message,
      text: err.toString()
    }
  })
})

app.get('/', (req, res) => {
  res.send('')
})

require('./routes/auth')(app)
require('./routes/orders')(app)
require('./routes/stripe')(app)
require('./routes/discounts')(app)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\nListening on port ${PORT}\n`)
})
