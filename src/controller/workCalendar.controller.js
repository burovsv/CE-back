const db = require('../models');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const { getWorkTableBySubdivisonAndDate } = require('./employee.controller');
const { v4: uuidv4 } = require('uuid');
var xl = require('excel4node');
const path = require('path');
const Employee = db.employees;
const WorkCalendar = db.workCalendar;
const Subdivision = db.subdivisions;
const EmployeeWorkCalendar = db.employeeWorkCalendar;
const EmployeeHidden = db.employeeHidden;
const EmployeeOrder = db.employeeOrder;
const AcceptWorkTable = db.acceptWorkTable;
const SubdivisionWorkTimeTemplates = db.subdivisionWorkTimeTemplates;
class WorkCalendarController {
  async getWorkCalendarBySubdivition(req, res) {
    const { postId, subdivisionId } = req.params;

    res.json('hello');
  }
  async getWorkCalendarMonth(req, res) {
    const { date, subdivision } = req.query;

    console.log('SUBDIV', subdivision);
    const authHeader = req.headers['request-token'];

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
    const { calendar, monthYear, subdivision, workTimeTemplate, hiddenEmployees } = req.body;
    for (let hiddenEmployeeItem of hiddenEmployees) {
      await EmployeeHidden.upsert({
        employeeId: hiddenEmployeeItem,
        subdivisionId: subdivision,
      });
    }
    const findExistWorkTimeTemplate = await SubdivisionWorkTimeTemplates.findOne({ where: { subdivisionId: subdivision } });
    const dataWorkTimeTemplate = {
      timeStart1: workTimeTemplate?.workTimeStart1,
      timeStart2: workTimeTemplate?.workTimeStart2,
      timeStart3: workTimeTemplate?.workTimeStart3,
      timeStart4: workTimeTemplate?.workTimeStart4,
      timeEnd1: workTimeTemplate?.workTimeEnd1,
      timeEnd2: workTimeTemplate?.workTimeEnd2,
      timeEnd3: workTimeTemplate?.workTimeEnd3,
      timeEnd4: workTimeTemplate?.workTimeEnd4,
      active1: workTimeTemplate?.active1,
      active2: workTimeTemplate?.active2,
      active3: workTimeTemplate?.active3,
      active4: workTimeTemplate?.active4,
    };
    if (findExistWorkTimeTemplate) {
      await SubdivisionWorkTimeTemplates.update(dataWorkTimeTemplate, { where: { subdivisionId: subdivision } });
    } else {
      await SubdivisionWorkTimeTemplates.create({ ...dataWorkTimeTemplate, subdivisionId: subdivision });
    }
    for (let calendarItem of calendar) {
      const findEmployeeOrder = await EmployeeOrder.findOne({
        where: { employeeId: calendarItem?.userId, subdivisionId: subdivision },
      });
      if (findEmployeeOrder) {
        await EmployeeOrder.update(
          {
            order: calendarItem?.orderEmployee,
          },
          {
            where: {
              id: findEmployeeOrder?.id,
            },
          },
        );
      } else {
        await EmployeeOrder.create({
          employeeId: calendarItem?.userId,
          subdivisionId: subdivision,
          order: calendarItem?.orderEmployee,
        });
      }
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
          date: moment(new Date(monthYear).toISOString()).format('YYYY-MM').toString() + '-01',
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
        active: true,
      },
    });
    const resultArr = await getWorkTableBySubdivisonAndDate(monthYear, findSubdivion?.idService);
    try {
      const response = await axios.post(`http://ExchangeHRMUser:k70600ga@192.168.240.196/zup_pay/hs/Exch_LP/timetable?id=${findSubdivion?.idService}&date=${new Date(monthYear).toISOString()}`, resultArr);
      console.log('Import Success !!! ', response.data);
    } catch (error) {
      console.log('Import Error !!! ', error);
    }

    res.json(true);
  }

  async exportWorkCalendarToExcel(req, res) {
    const { tableData } = req.body;
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Отчет');

    let countRow = 3;
    try {
      Object.keys(tableData).forEach(function (key, index) {
        let countCell = 1;
        let lastRow = countRow;
        if (tableData[key][0]?.height) {
          lastRow++;
        }
        tableData[key]?.map((itemCell, indexCell) => {
          let nextCell = countCell + 1;
          countCell += itemCell?.width;
          if (itemCell?.type === 'hours' && Array.isArray(itemCell?.value)) {
            ws.cell(countRow, nextCell, lastRow, countCell, true)
              .string(`${itemCell?.value?.[0]}\n${itemCell?.value?.[1]}`)
              .style({ alignment: { horizontal: 'center', vertical: 'center', wrapText: true } });
          } else if (itemCell?.type === 'work' && Array.isArray(itemCell?.value)) {
            ws.cell(countRow, nextCell, lastRow, nextCell, true)
              .string(`${itemCell?.value?.[0]}\n${itemCell?.value?.[2]}`)
              .style({ alignment: { horizontal: 'center', vertical: 'center', wrapText: true } });
            ws.cell(countRow, countCell, lastRow, countCell, true)
              .string(`${itemCell?.value?.[1]}\n${itemCell?.timeTable || ''}`)
              .style({ alignment: { horizontal: 'center', vertical: 'center', wrapText: true } });
          } else {
            if (itemCell?.timeTable) {
              // const timeTableString = itemCell?.timeTable ? `${itemCell?.value?.split('\n')?.[0]}\n${itemCell?.timeTable}` : itemCell?.value;
              ws.cell(countRow, nextCell, lastRow, countCell, true)
                .string(itemCell?.value)
                .style({ alignment: { horizontal: 'center', vertical: 'center', wrapText: true } });
            } else {
              ws.cell(countRow, nextCell, lastRow, countCell, true)
                .string(itemCell?.value)
                .style({ alignment: { horizontal: 'center', vertical: 'center' } });
            }
          }
        });
        countRow++;
      });
    } catch (error) {
      console.log(error);
    }

    const fileName = `${uuidv4()}.xlsx`;
    wb.write(path.join(path.resolve('./'), '/public/excel', `/${fileName}`), function (err, stats) {
      if (err) {
        throw new CustomError(400);
      } else {
        res.json({ file: `${process.env.SITE_IP}/excel/${fileName}`, fileName: fileName });
      }
    });
    // console.log(tableData);
  }

  async getAcceptWorkTable(req, res) {
    const { date } = req.query;
    let formatData = moment(date).format('YYYY-MM-DD').toString();
    const acceptWorkTableList = await AcceptWorkTable.findAll({ where: { date: formatData } });
    res.json(acceptWorkTableList);
  }

  async getAcceptWorkTableSingle(req, res) {
    const { date, subdivisionId } = req.query;
    let formatData = moment(date).format('YYYY-MM-DD').toString();
    const acceptWorkTableList = await AcceptWorkTable.findOne({ where: { date: formatData, subdivisionId } });
    res.json(acceptWorkTableList);
  }
  async switchAcceptWorkTable(req, res) {
    const { subdivisionId, date, status, directorComment, managerComment } = req.body;
    let formatData = moment(date).format('YYYY-MM-DD').toString();
    const findExistAcceptWorkTable = await AcceptWorkTable.findOne({
      where: {
        date: formatData,
        subdivisionId,
      },
    });
    if (findExistAcceptWorkTable) {
      await AcceptWorkTable.update(
        {
          ...(directorComment !== undefined && { directorComment }),
          ...(managerComment !== undefined && { managerComment }),
          status,
        },
        {
          where: {
            id: findExistAcceptWorkTable?.id,
          },
        },
      );
    } else {
      await AcceptWorkTable.create({ subdivisionId, date: formatData, status, ...(directorComment !== undefined && { directorComment }), ...(managerComment !== undefined && { managerComment }) });
    }
    res.json(true);
  }
}
module.exports = new WorkCalendarController();
