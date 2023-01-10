const db = require('../models');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const { getWorkTableBySubdivisonAndDate } = require('./employee.controller');

const Employee = db.employees;
const WorkCalendar = db.workCalendar;
const Subdivision = db.subdivisions;
const EmployeeWorkCalendar = db.employeeWorkCalendar;
class WorkCalendarController {
  async getWorkCalendarBySubdivition(req, res) {
    const { postId, subdivisionId } = req.params;

    res.json('hello');
  }
  async getWorkCalendarMonth(req, res) {
    const { date, subdivision } = req.query;
    console.log('SUBDIV', subdivision);
    const authHeader = req.headers['request_token'];

    if (!authHeader) {
      throw new CustomError(401, TypeError.PROBLEM_WITH_TOKEN);
    }
    const tokenData = jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, tokenData) => {
      if (err) {
        throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
      }
      return tokenData;
    });
    const employee = await Employee.findOne({
      where: {
        idService: tokenData?.id,
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: WorkCalendar,
          where: {
            date,
            subdivisionId: subdivision,
          },
          required: false,
        },
      ],
    });
    res.json(employee);
  }

  async upsertWorkCalendarBySubdivision(req, res) {
    const { calendar, monthYear, subdivision } = req.body;
    for (let calendarItem of calendar) {
      let formatCalendarData = calendarItem?.calendarData
        ?.filter((value) => Object.keys(value).length !== 0)
        ?.map((val) => {
          delete val.id;
          if (val?.type !== 'work') {
            delete val.endTime;
            delete val.startTime;
          }
          return val;
        });
      const formatCalendarDataString = JSON.stringify(formatCalendarData);

      if (calendarItem?.existWorkCalendarId) {
        await WorkCalendar.update(
          {
            calendarData: formatCalendarDataString,
          },
          { where: { id: calendarItem?.existWorkCalendarId } },
        );
      } else {
        const createWorkCalendar = await WorkCalendar.create({
          active: true,
          calendarData: formatCalendarDataString,
          date: moment(monthYear).format('YYYY-MM').toString() + '-01',
          subdivisionId: subdivision,
        });

        const createEmployeeWorkCalendar = await EmployeeWorkCalendar.create({
          employeeId: calendarItem?.userId,
          workCalendarId: createWorkCalendar?.id,
        });
      }
    }
    const findSubdivion = await Subdivision.findOne({
      where: {
        id: subdivision,
      },
    });
    const resultArr = await getWorkTableBySubdivisonAndDate(monthYear, findSubdivion?.idService);
    try {
      const response = await axios.post(`http://ExchangeHRMUser:k70600ga@192.168.240.196/zup_pay/hs/Exch_LP/timetable?id=${subdivision?.idService}&date=${monthYear}`, resultArr);
      console.log('Import Success !!! ', response.data);
    } catch (error) {
      console.log('Import Error !!! ', error);
    }

    res.json(true);
  }
}
module.exports = new WorkCalendarController();
