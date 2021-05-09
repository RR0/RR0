import common, {CommonModule, org} from "../src/common"

import people from '../people/people'
import nav, {NavModule} from "../src/nav/nav"
import lang, {LangModule} from "../src/lang"
import net, {NetModule} from "../src/net"

declare var google

class Moment {
  startDate: any
  private decade: boolean
  private dayOfMonth: any
  private timeZone: any
  private year: any
  private month: any
  private hour: any
  private minutes: any
  private seconds: any
  private approx: any

  constructor() {
    this.decade = false
    this.dayOfMonth = null
    this.timeZone = null
    this.year = null
    this.month = null
    this.hour = null
    this.minutes = null
    this.seconds = null
  }

  clear() {
    this.decade = false
    this.dayOfMonth = null
    this.timeZone = null
    this.year = null
    this.month = null
    this.hour = null
    this.minutes = null
    this.seconds = null
  }

  setSeconds(s?) {
    this.seconds = s
  }

  setMinutes(mn?) {
    this.minutes = mn
    this.setSeconds()
  }

  setHour(h?) {
    this.hour = h
    this.setMinutes()
  }

  setTimeZone(z) {
    this.timeZone = z
  }

  setDayOfMonth(d?) {
    this.dayOfMonth = d
    this.setHour()
  }

  setMonth(m?) {
    this.month = m
    this.setDayOfMonth()
  }

  setYear(number) {
    this.year = number
    this.setMonth()
  }

  getYear() {
    return this.year
  }

  getMonth() {
    return this.month
  }

  getDayOfMonth() {
    return this.dayOfMonth
  }

  getHour() {
    return this.hour
  }

  getMinutes() {
    return this.minutes
  }

  getSeconds() {
    return this.seconds
  }

  getTimeZone() {
    return this.timeZone
  }

  isApprox() {
    return this.approx
  }

  fromString(dString) {
    var number
    var hourNumber
    var era
    var txt
    var monthReady
    var zReady

    var self = this

    var resetParse = function () {
      self.clear()
      number = null
      hourNumber = null
      era = 1
      txt = null
      monthReady = undefined
      zReady = undefined
    }

    resetParse.call(this)

    function setTz(c) {
      var z
      switch (txt) {
        case 'Z':
        case 'UTC':
        case 'TU':
        case 'UT':
        case 'GMT':
          z = 0
          break
        case 'EGT':
          z = -1
          break
        case 'ADT':
        case 'HAA':
        case 'WGT':
          z = -3
          break
        case 'EDT':
        case 'AST':
        case 'HAE':
          z = -4
          break
        case 'EST': // Eastern Daylight Time
        case 'CDT':
        case 'ET':
        case 'HAC':
          z = -5
          break
        case 'CST':
        case 'MDT':
          z = -6
          break
        case 'MST':
        case 'PDT':
          z = -7
          break
        case 'PST':
          z = -8
          break
        default:
          return
      }
      self.setTimeZone(z)
      txt = null
    }

    function value() {
      return number !== null ? (zReady ? number : (txt !== null ? txt + number : number)) : (txt !== null ? txt : null)
    }

    var i

    function timeSet() {
      var valueToSet = value()
      var valueIsNumber = typeof valueToSet === 'number'
      if (self.year && valueIsNumber && number <= 59) {
        monthReady = monthReady || dString.charAt(i) === '-'
        if (!monthReady) {
          if (self.month) {
            if (self.dayOfMonth || self.hour) {
              if (self.hour) {
                if (self.minutes) {
                  if (self.seconds) {
                    self.setDayOfMonth(valueToSet)     // setHour is processed after ':' only
                  } else {
                    self.setSeconds(valueToSet)
                  }
                } else {
                  self.setMinutes(valueToSet)
                }
              } else {
                self.setDayOfMonth(valueToSet)     // setHour is processed after ':' only
              }
            } else {
              self.setDayOfMonth(valueToSet)
            }
          } else {
            // Probably just text
          }
        } else {
          self.setMonth(valueToSet)
          monthReady = false
        }
      } else if (self.minutes) {
        if (valueIsNumber) {
          self.setSeconds(valueToSet)
        }
      } else if (self.hour) {
        self.setMinutes(valueToSet)
      } else {
        self.setYear(era * number)
        monthReady = true
      }
      number = null
    }

    function parseEnd() {
      var val = value()
      if (val !== null && val !== undefined) {
        timeSet.call(self) // End of date
      }
      if (txt) {
        setTz.call(self)
      }
    }

    for (i = 0; i < dString.length; i++) {
      var c = dString.charAt(i)
      var digit = null
      switch (c) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          digit = (c - 33) // - '0'
          if (number === null) {
            number = digit * era
          } else {
            number = number * 10 + digit
          }
          break
        case '-':
          if (!txt) {
            if (number === null) {
              era = -1
            }
            this.setHour(null)  // Next value cannot be minutes
            timeSet.call(this) // End of year or month
          } else {
            txt = txt ? txt + c : c
          }
          break
        case 's':
          if (number !== null && txt.charAt(i - 1) !== ' ') {
            this.decade = true
          } else {
            txt = txt ? txt + c : c
          }
          break
        case '+':
          era = 1
          break
        case '~':
          this.approx = true
          break
        case ':':
          if (this.hour !== null && zReady) {
            this.setTimeZone(number * era)
          } else if (this.minutes) {
            this.setSeconds(value())
            zReady = true
          } else if (this.hour) {
            this.setMinutes(value())
            zReady = true
          } else {
            this.setHour(value())
          }
          number = null
          break
        case 'T':
          if (!txt) {
            hourNumber = !isNaN(dString.charAt(i + 1))
          } else {
            txt = txt ? txt + c : c
            break
          }
        case ' ':
          if (!hourNumber && (txt || zReady)) {
            txt = txt ? txt + c : c
          } else {
            timeSet.call(this) // End of date
          }
          break
        case '/':
          parseEnd.call(this)
          this.startDate = org.clone(this)
          org.rr0.context.time = this.startDate
          resetParse.call(this)
          break
        default:
          if (number) {
            timeSet.call(this) // End of minutes or seconds
          }
          if (digit) {
            txt = txt ? txt + digit : digit
            number = null
            digit = null
          }
          txt = txt ? txt + c : c
      }
    }
    parseEnd.call(this)
    return this
  }
}

class Unit {
  factor: any
  name: any

  constructor(f, n) {
    this.factor = f
    this.name = n
  }

  toString(value) {
    return value > 0 ? value + '&nbsp;' + this.name + (value > 1 ? 's' : '') : ''
  }
}

class Duration {
  durationInSeconds: number
  second: Unit
  minute: Unit
  hour: Unit
  day: Unit
  unit: Unit

  constructor() {
    'use strict'
    const durationThis = this

    durationThis.second = new Unit(1, 'seconde')
    durationThis.minute = new Unit(60 * durationThis.second.factor, 'minute')
    durationThis.hour = new Unit(60 * durationThis.minute.factor, 'heure')
    durationThis.day = new Unit(24 * durationThis.hour.factor, 'jour')
  }

  fromString(txt) {
    const durationThis = this
    var durationRegex = /P(\d+D)*(\d+H)*(\d+M)*(\d+S)*/
    var foundExprs = durationRegex.exec(txt)
    durationThis.durationInSeconds = 0
    for (var i = 1; i < foundExprs.length; i++) {
      var expr = foundExprs[i]
      if (expr) {
        var lastCharPos = expr.length - 1
        var value = parseInt(expr.substring(0, lastCharPos), 10)
        switch (expr.charAt(lastCharPos)) {
          case 'D':
            durationThis.unit = durationThis.day
            break
          case 'H':
            durationThis.unit = durationThis.hour
            break
          case 'M':
            durationThis.unit = durationThis.minute
            break
          case 'S':
            durationThis.unit = durationThis.second
            break
          case 'P':
        }
        durationThis.durationInSeconds += value * durationThis.unit.factor
      }
    }

    return this
  }

  toString(unitStated) {
    var durationThis = this
    var txt = []
    var remaining = durationThis.durationInSeconds
    var days = Math.floor(remaining / durationThis.day.factor)
    if (days >= 1) {
      txt.push(unitStated !== durationThis.day.name ? durationThis.day.toString(days) : days)
    }
    remaining = remaining % durationThis.day.factor
    var hours = Math.floor(remaining / durationThis.hour.factor)
    if (hours >= 1) {
      txt.push(unitStated !== durationThis.hour.name ? this.hour.toString(hours) : hours)
    }
    remaining = remaining % durationThis.hour.factor
    var minutes = Math.floor(remaining / durationThis.minute.factor)
    if (minutes >= 1) {
      txt.push(unitStated !== durationThis.minute.name ? durationThis.minute.toString(minutes) : minutes)
    }
    remaining = remaining % durationThis.minute.factor
    var seconds = remaining
    if (seconds >= 1) {
      txt.push(unitStated !== durationThis.second.name ? durationThis.second.toString(seconds) : seconds)
    }
    var last = txt.length - 1
    var s = ''
    for (var i = last; i >= 0; i--) {
      s = (i === last && i > 0 ? ' et ' : i > 0 ? ', ' : '') + txt[i] + s
    }
    return s
  }
}

export class TimeService {
  chartZone = null

  constructor(private $locale, private timeRoot, private commonsService) {
    'use strict'

    /**
     * http://www.w3.org/html/wg/drafts/html/master/text-level-semantics.html#the-time-element
     * http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#global-dates-and-times
     *
     * ((-)?[1-9]\d{3})(-(\d{1,2})(-(\d{1,2})(T\d{1,2}:\d{1:2])?)?)?
     *
     * 1947-06-21T14:20-02:00
     */
    var times

    var self = this

    var paramLang = function (lang) {
      return (!lang) ? org.rr0.context.language : lang
    }

    org.rr0.context.time = new Moment()

    var chart
  }

  addYear(y, yLink, t) {
    const self = this
    var s = ""
    if (!y) {
      y = self.getTime().year
    }
    if (!yLink) {
      yLink = self.yearLink(y)
    }
    if (!t) {
      var p = (<any>people).getPeople()
      if (p) {
        t = p.toString()
        if (p.born) {
          t += " a " + (y - p.born.getFullYear()) + " ans"
        } else {
          t = "Naissance de " + t
        }
      }
    }
    if (y) {
      s += org.link(yLink, y, t)
    }
    return s
  }

  toISOString(moment) {
    var s = moment.year
    if (moment.month) {
      s += '-' + this.commonsService.zero(moment.month)
    }
    if (moment.dayOfMonth) {
      s += '-' + this.commonsService.zero(moment.dayOfMonth)
    }
    if (moment.hour) {
      s += 'T' + this.commonsService.zero(moment.hour) + ":" + this.commonsService.zero(moment.minutes)
    }
    return s
  }

  /*getTimes: function () {
   if (typeof google !== 'undefined' && typeof google.visualization !== 'undefined' && !times) {
   times = createTimesData();
   }
   return times;
   },*/
  setChartsHeight(h) {
    this.chartZone.style.height = h + '%'
    org.rr0.getSideZone("map-canvas").style.height = (100 - h) + '%'
  }

  /*drawChart: function () {
   if (times) {
   var options = {
   'title': "Heures d'observation",
   'width': this.chartZone.offsetWidth,
   'height': this.chartZone.offsetHeight - document.getElementById("head").offsetHeight,
   legend: {position: 'none'}
   };
   chart.draw(times, options);
   } else {
   self.setChartsHeight(0);
   }
   },*/
  NewDuration() {
    return new Duration()
  }

  NewMoment() {
    return new Moment()
  }

  getDate(y?, m?, d?): Date {
    let dat
    if (!y) {
      y = this.getYear()
    }
    if (y) {                    // No getTime().year set means no date set
      dat = new Date()
      dat.setFullYear(y)
      if (!d) {
        d = this.getDayOfMonth()
      }
      dat.setDate(d)
      if (!m) {
        m = this.getMonth()
      }
      if (m) {
        dat.setMonth(m - 1)
      }
    }
    return dat
  }

  getTime() {
    return org.rr0.context.time
  }

  getMonth() {
    return this.getTime().month
  }

  addMonth(m) {
    var s = ""
    var t = this.getTime()
    if (m) {
      t.month = m
    }
    if (t.month) {
      s += this.monthName()
    }
    return s
  }

  /**
   *
   * @param d
   * @returns {string}
   */
  addDayOfMonth(d) {
    var s = ""
    var t = this.getTime()
    if (!d) {
      d = t.dayOfMonth
    }
    if (d) {
      var dayName = this.dayOfWeekName(this.getDayOfWeek(t.year, t.month, d))
      s += dayName + " "
      s += (d === 1 ? "1<sup>er</sup>" : d)
    }
    return s
  }

  addDate(p, y, m, d) {
    if (!y) {
      y = this.getTime().year
    }
    var s = ""
    if (y) {
      if (!m) {
        m = this.getMonth()
      }
      if (!d) {
        d = this.getTime().dayOfMonth
      }
      var newDate = new Date()
      newDate.setFullYear(y)
      var dateLink = this.yearLink(y)
      if (m) {
        newDate.setMonth(m)
        dateLink += "/" + org.zero(m)
        if (d) {
          newDate.setDate(d)
//                s = "le ";
          s += this.addDayOfMonth(d)
          dateLink += "/" + org.zero(d)
        } else {
//                s = "en ";
        }
        s += " " + this.addMonth(m)
      } else {
//            s += "en ";
      }
      var t = null
      s += " " + this.addYear(y, dateLink, t)
    }
    return s
  }

  monthNames() {
    return this.$locale.DATETIME_FORMATS.MONTH
  }

  /*            getTime: function () {
   return addDate();
   },*/
  monthName(m?) {
    if (!m) {
      var t = this.getTime()
      if (t.month) {
        m = t.month
      }
    }
    return this.monthNames()[m - 1]
  }

  /**
   * Builds a address to link to a year page/directory.
   *
   * @param y The year
   * @param decade if the year (such as "1950") is to be understood as a decade (1950s).
   * @returns {string} The link
   */
  yearLink(y, decade?) {
    var yString = y.toString()
    var yLink = this.timeRoot
    var pos = 0
    yLink += (y < 1000 ? "0" : yString.substring(pos, ++pos)) + "/"
    yLink += (y < 100 ? "0" : yString.substring(pos, ++pos)) + "/"
    yLink += (y < 10 ? "0" : yString.substring(pos, ++pos)) + "/"
    if (!decade) {
      yLink += yString.substring(pos, ++pos)
    }
    return yLink
  }

  dayOfWeekNames() {
    return this.$locale.DATETIME_FORMATS.DAY
  }

  dayOfWeekName(d) {
    return this.dayOfWeekNames()[d]
  }

  getDayOfWeek(y?, m?, d?) {
    return this.getDate(y, m, d).getDay()
  }

  getDayOfMonth() {
    return this.getTime().dayOfMonth
  }

  setYear(y) {
    if (y) {
      this.getTime().year = y
    }
  }

  isTimeURL(u?) {
    if (!u) {
      u = this.commonsService.getUri()
    }
    return u.indexOf(this.timeRoot) === 0
  }

  getYear() {
    var t = this.getTime()
    if (!t.year) {
      var u = this.commonsService.getUri()
      if (this.isTimeURL(u)) {
        var parts = u.split("/")
        t.year = 0
        var mul = 1000
        for (var i = 2; i < parts.length; i++) {
          var v = parts[i]
          if (org.isNumber(v)) {
            if (i <= 5) {
              t.year += v * mul
              mul /= 10
            } else if (!t.month) {
              t.month = parseInt(v, 10)
            } else if (!t.dayOfMonth) {
              t.dayOfMonth = parseInt(v, 10)
            }
          } else {
            break
          }
        }
      }
    }
    return t.year
  }

  setHour(h) {
    if (h) {
      this.getTime().hour = h
    }
  }

  setMinutes(mn) {
    if (mn) {
      this.getTime().minutes = mn
    }
  }

  getHour() {
    return this.getTime().hour
  }

  setMonth(m) {
    if (m) {
      this.getTime().setMonth(m)
    }
  }

  setDayOfMonth(d) {
    if (d) {
      var t = this.getTime()
      t.dayOfMonth = d
      t.hour = null
      t.minutes = null
    }
  }

  toString(contextTime, time) {
    var timeLink
    var repYear
    var titYear
    var repMonth
    var titMonth
    var repDay
    var titDay
    var repHour
    var self = this
    var y = time.getYear()
    var otherYear
    if (y) {
      otherYear = y !== contextTime.getYear()
      timeLink = this.yearLink(y)
      titYear = y
      if (otherYear) {
        contextTime.setYear(y)
        repYear = " " + y
      }
    }
    var otherMonth
    var m = time.getMonth()
    if (m) {
      titMonth = this.monthName(m)
      timeLink += "/" + this.commonsService.zero(m)
      otherMonth = otherYear || m !== contextTime.getMonth()
      if (otherMonth) {
        contextTime.setMonth(m)
        repMonth = " " + titMonth
      }
    }
    var otherDay = 0
    var d = time.getDayOfMonth()
    if (d) {
      var dayAsNumber = parseInt(d, 10)
      var dOW
      if (!!(dayAsNumber)) {
        dOW = this.dayOfWeekName(this.getDayOfWeek(y, m, d))
        titDay = dOW + " " + d + (d === 1 ? "er" : "")
        otherDay = otherMonth ? 30 : d - contextTime.getDayOfMonth()
      } else {
        titDay = d
        otherDay = 1
      }
      if (otherDay !== 0) {
        timeLink += "/" + this.commonsService.zero(d)
        repDay = titDay
        if (!this.isTimeURL() && contextTime.getDayOfMonth()) {
          switch (otherDay) {
            case -1:
              repDay = "veille"
              break
            case 1:
              repDay = "lendemain"
              break
            case 2:
              repDay = "surlendemain"
              break
            default:
              if (otherDay <= 7) {
                repDay = otherDay < 0 ? dOW + " pr\xE9c\xE9dent" : dOW + " suivant"
              }
          }
        }
        contextTime.setDayOfMonth(d)
      }
    }
    var titHour
    var h = time.getHour()
    var otherHour

    function registerTimeToDraw(updatedHour) {
      /*          var timesToUpdate = self.getTimes();
       if (timesToUpdate) {
       self.setChartsHeight(30);
       for (var i = 0; i < timesToUpdate.getNumberOfRows(); i++) {
       var iteratedHour = timesToUpdate.getValue(i, 0);
       if (iteratedHour === updatedHour) {
       var countForThatHour = timesToUpdate.getValue(i, 1);
       countForThatHour++;
       timesToUpdate.setValue(i, 1, countForThatHour);
       break;
       }
       }
       }*/
    }

    function handleHour() {
      var hourAsNumber = parseInt(h, 10)
      if (!!(hourAsNumber)) {
        titHour = this.commonsService.zero(h)
      } else {
        titHour = h
        otherHour = true
      }
      if (h) {
        registerTimeToDraw(h)
      }
      otherHour = otherHour || otherDay || h !== contextTime.getHour()
      if (d) {
        titHour = (time.isApprox() ? 'vers' : '\xE0') + ' ' + titHour
      }
      if (otherHour) {
        contextTime.setHour(h)
      }// TODO: else manage to display "30 mn later"
      repHour = titHour  // For now, always display hours, even if unchanged
    }

    if (h) {
      handleHour()
    }
    var mn = time.getMinutes()
    if (mn || h) {
      var th = ':' + this.commonsService.zero(mn)
      titHour += th
      var otherMinutes = otherHour || mn !== contextTime.getMinutes()
      if (otherMinutes) {
        contextTime.setMinutes(mn)
        repHour += th
      }
    }
    var s = time.getSeconds()
    if (s) {
      var ts = ':' + this.commonsService.zero(s)
      titHour += ts
      var otherSeconds = otherMinutes || s !== contextTime.getSeconds()
      if (otherSeconds) {
        contextTime.setSeconds(s)
        repHour += ts
      }
    }
    var titZ
    var z = time.getTimeZone()
    if (z) {
      titZ = "(UTC" + (z >= 0 ? '+' : "") + z + ")"
    }
    var replacement = ""
    var title = ""
    if (repDay) {
      replacement += repDay
    }
//            else {
//                if (! repMonth) {
//                    replacement = "m\xEAme jour";
//                }
//            }
    if (titDay) {
      title += titDay
    }
    if (repMonth) {
      replacement += repMonth
    }
    if (titMonth) {
      title += " " + titMonth
    }
    if (repYear) {
      replacement += repYear
    }
    if (titYear) {
      title += " " + titYear
    }
    if (repHour) {
      replacement += " " + repHour
    }
    if (titHour) {
      title += ", " + titHour
    }
    if (titZ) {
      title += " " + titZ
    }
    if (time.startDate) {
      var start = self.toString(time, time.startDate).replacement
      var end = replacement
      var betweenWord = repDay ? 'au' : '\xE0'
      replacement = start + ' ' + betweenWord + ' ' + end
      title = start + ' ' + betweenWord + ' ' + title
    }
    return {
      "replacement": replacement.trim(),
      "timeLink": timeLink,
      "title": title.trim()
    }
  }
}

export class TimeModule {
  timeRoot = '/time/'

  preYearWords = ["en", "de", "à", "dès", "vers", "depuis", "jusqu'en", "année", "années", "fin", "début", "printemps", "été", "automne", "hiver", "avant", "entre", "et", "ou"]
  preMonthWords = ["en", "de", "à", "dès", "vers", "depuis", "jusqu'en", "mois", "fin", "début", "avant", "entre", "et", "ou"]
  preDayWords = ["au", "le", "du", "à", "vers", "jusqu'au",
    "Au", "Le", "Du", "À", "Vers", "Jusqu'au"]
  readonly service: TimeService

  constructor(private common: CommonModule, lang: LangModule, nav: NavModule, private net: NetModule) {
    const navigationService = nav.service
    navigationService.addStart({
        dir: this.timeRoot,
        label: "<span class='iconic clock'> <span class='label'>Historique</span></span>",
        title: "Historique"
      }
    )
    nav.service.nextHandlers.push((nextLink, next) => {
      let nn
      if (this.service.getYear()) {
        nn = this.nextFromTime(next)
      }
      return nn
    })
    nav.service.prevHandlers.push((prevLink, prev) => {
      let pp
      if (this.service.getYear()) {          // If no previous link has been specified, try to devise previous from
        // context time.
        pp = this.previousFromTime()
      }
      return pp
    })
    nav.service.prevHandlers.push(this.titleFromTime.bind(this))

    /*if (typeof google !== 'undefined') {
     initGoogleCharts(function () {
     timeService.chartZone = org.rr0.getSideZone("chart");
     var chart = new google.visualization.ColumnChart(timeService.chartZone);
     org.rr0.sideCallbacks = org.rr0.sideCallbacks.concat([timeService.drawChart]);

     for (var i = 0; i < onGoogleChartsLoaded.length; i++) {
     onGoogleChartsLoaded[i]();
     }
     });
     } else {
     console.warn("Google API is not loaded");
     }*/
    this.service = new TimeService(lang.userLang, this.timeRoot, common.service)
  }

  /**
   * Find some time-dedicated page near a given time.
   *
   * @param oy The starting year.
   * @param m The starting month.
   * @param changeProc How to determine the next date to look for.
   * @param foundProc What to do once a sibling page has been found.
   */
  findTimeSibling(oy, m, changeProc, foundProc) {
    org.log('Looking for time sibling of %o-%o', oy, m)
    const ret = changeProc(oy, m)
    const y = ret.y
    let l = this.service.yearLink(y)
    m = ret.m
    let label = y
    const self = this
    if (m) {
      nav.service.setContents(oy, this.service.yearLink(oy))
      l += "/" + this.common.service.zero(m)
      label = this.service.monthName(m)
      if (y !== this.service.getTime().year) {
        label += ' ' + y
      }
    } else {
      const cLink = this.service.yearLink(oy, true)
      if (cLink !== this.common.service.getUri()) {
        nav.service.setContents(~~(oy / 10) + "0s", cLink)
      }
    }
    this.net.service.onExists(l)
      .then(function (req) {
        const foundSibling = {label: label, link: l}
        org.log('Found sibling %o', foundSibling)
        foundProc(foundSibling)
      })
      .catch(function (failReq) {
        const currentDate = new Date()
        if (y < currentDate.getFullYear()) {
          self.findTimeSibling(y, m, changeProc, foundProc)
        }
      })
  }

  private nextFromTime(n) {
    const t = this.service.getTime()
    const self = this
    const lookAfter = function (y, m) {
      if (m) {
        if (m < 12) {
          m++                    // Before December?
          return {y: y, m: m}    // Return date with incremented month
        } else {
          m = 1                  // January
        }
      }
      y++
      return {y: y, m: m}        // Return date with incremented year
    }
    return new Promise((resolve, reject) => {
      self.findTimeSibling(t.year, t.month, lookAfter, resolve)
    })
  }

  private titleFromTime() {
    let title = this.service.getYear()
    if (title) {
      if (this.service.getTime().month) {
        title = this.service.monthName() + " " + title
        const dayOfMonth = this.service.getDayOfMonth()
        if (dayOfMonth) {
          title = this.service.dayOfWeekName(this.service.getDayOfWeek()) + " " + dayOfMonth + " " + title
        }
      }
    }
    return title
  }

  private previousFromTime() {
    const t = this.service.getTime()
    const self = this
    const lookBefore = function (y, m) {
      if (m) {
        if (m > 1) {            // Month above february?
          m--
          return {y: y, m: m}  // Return date with decremented month
        } else {
          m = 12               // December
        }
      }
      y--                      // Return date with decremented year
      return {y: y, m: m}
    }
    return new Promise((resolve, reject) => {
      self.findTimeSibling(t.year, t.month, lookBefore, resolve)
    })
  }

  private initGoogleCharts(chartsApiLoaded) {
    google.load('visualization', '1.0', {
      'packages': ['corechart'],
      callback: chartsApiLoaded
    })
  }
}

const time = new TimeModule(common, lang, nav, net)
export default time
