const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const jwt = require('jsonwebtoken');
var mime = require('mime-types');
var moment = require('moment');
fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var xl = require('excel4node');

const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const { parseInt } = require('lodash');
const isValidUUID = require('../utils/isValidUUID');
const getFirstPartUUID = require('../utils/getFirstPartUUID');
const paginate = require('../utils/paginate');
const getDataFromToken = require('../utils/getDataFromToken');
const TelegramBot = require('node-telegram-bot-api');
const { getDaysInMonth } = require('../utils/getDaysInMouth');
const { compitionData, compitionSubdivData, compitionSubdivEmployeeData, compitionSubdivProducts } = require('../utils/testData');
// const { timeTableResponse } = require('../utils/testData');
// const { testSyncEmployees } = require('../utils/testData');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const Employee = db.employees;
const CategoryEmployee = db.categoryEmployees;
const Post = db.posts;
const Category = db.categories;
const Subdivision = db.subdivisions;
const EmployeeHistory = db.employeeHistories;
const PostSubdivision = db.postSubdivisions;
const WorkCalendar = db.workCalendar;
const CategoryPostSubdivision = db.categoryPostSubdivisions;
const AccessWorkTableEmployee = db.accessWorkTableEmployee;
class EmployeeController {
  async syncGlobal(req, res) {
    await axios.get(`${process.env.SERVER_DOMAIN}/api/post/sync`);
    await axios.get(`${process.env.SERVER_DOMAIN}/api/subdivision/sync`);
    await axios.get(`${process.env.SERVER_DOMAIN}/api/employee/sync`);
    res.json({ success: true });
  }
  async feedbackEmployee(req, res) {
    const { message, anonym } = req.body;
    const employee = await getDataFromToken(req);
    const findPost = await Post.findOne({
      where: { id: employee?.postSubdivision?.postId },
    });
    const findSubdivision = await Subdivision.findOne({
      where: { id: employee?.postSubdivision?.subdivisionId },
    });
    console.log({ name: employee.firstName, post: findPost?.name, subdivision: findSubdivision?.name });
    const messageTelegram = `
${!anonym ? employee.firstName + ' ' + employee.lastName : ''}
${findSubdivision?.name}
${findPost?.name}
Сообщение: "${message}"
Анонимно: ${anonym ? 'Да' : 'Нет'}
    `;
    bot.sendMessage(-750461609, messageTelegram);
    res.json({ success: true });
  }
  async deleteEmployee(req, res) {
    const { employeeId } = req.body;
    await Employee.update(
      { active: false },
      {
        where: { id: employeeId },
      },
    );
    res.json({ success: true });
  }
  async downloadEmployees(req, res) {
    const { subdivision } = req.query;
    console.log(subdivision);
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Отчет');

    let employeeListWithPost = [];
    let findPostSubdivisions = [];

    if (subdivision) {
      findPostSubdivisions = await PostSubdivision.findAll({
        where: { subdivisionId: subdivision },
      });
    }
    const employeeList = await Employee.findAll({
      ...(findPostSubdivisions?.length !== 0 && {
        where: {
          postSubdivisionId: {
            $in: findPostSubdivisions?.map((findPostSub) => findPostSub?.id),
          },
        },
      }),
      include: [
        {
          model: PostSubdivision,
          as: 'postSubdivision',
        },
        { model: Category },
      ],
    });

    for (let testItem of employeeList) {
      const findCat = await Post.findOne({
        where: { id: testItem?.postSubdivision?.postId },
      });
      const findSubdiv = await Subdivision.findOne({
        where: { id: testItem?.postSubdivision?.subdivisionId },
      });
      const findSubdivCat = await CategoryPostSubdivision.findAll({
        where: {
          postSubdivisionId: testItem?.postSubdivisionId,
          active: true,
        },
      });
      const findCats = await Category.findAll({
        where: {
          id: {
            $in: findSubdivCat?.map((findCatItem) => findCatItem?.categoryId),
          },
        },
      });
      employeeListWithPost.push({ ...testItem.toJSON(), post: findCat?.name, subdivision: findSubdiv?.name, cats: findCats });
    }
    let row = 4;
    employeeListWithPost.map((item) => {
      ws.cell(row, 1)
        .string(`${item?.firstName} ${item?.lastName}`)
        .style({ alignment: { vertical: 'top' } });
      ws.cell(row, 2)
        .string(item?.post)
        .style({ alignment: { vertical: 'top' } });
      ws.cell(row, 3)
        .string(item?.subdivision)
        .style({ alignment: { vertical: 'top' } });
      ws.cell(row, 4)
        .string(item?.categories?.map((cat) => cat?.name).join('\n'))
        .style({ alignment: { wrapText: true } });

      ws.cell(row, 5)
        .string(item?.coefficient.toString())
        .style({ alignment: { vertical: 'top' } });
      ws.cell(row, 6)
        .string(item?.idService.substring(0, 8))
        .style({ alignment: { vertical: 'top' } });
      ws.cell(row, 7)
        .string(item?.tel.toString())
        .style({ alignment: { vertical: 'top' } });
      row++;
    });
    ws.cell(3, 1).string('ФИО');
    ws.cell(3, 2).string('Должность');
    ws.cell(3, 3).string('Подразделение');
    ws.cell(3, 4).string('Категории');
    ws.cell(3, 5).string('Коэффицент');
    ws.cell(3, 6).string('Пароль');
    ws.cell(3, 7).string('Логин');
    const fileName = `${uuidv4()}.xlsx`;
    wb.write(path.join(path.resolve('./'), '/public/excel', `/${fileName}`), function (err, stats) {
      if (err) {
        throw new CustomError(400);
      } else {
        res.json({ file: `${process.env.SITE_IP}/excel/${fileName}`, fileName: fileName });
      }
    });
  }
  async authAdmin(req, res) {
    res.json({ success: 'ok' });
  }
  async uploadAvatar(req, res) {
    const employee = await getDataFromToken(req);
    if (!employee) {
      throw new CustomError(401, TypeError.NOT_FOUND);
    }
    if (!req.file) {
      throw new CustomError(401, TypeError.PARAMS_INVALID);
    }
    let imageGenName;
    if (req.file) {
      const imagePath = path.join(path.resolve('./'), '/public/images');
      const imageExtension = mime.extension(req.file.mimetype);
      imageGenName = `${uuidv4()}.${imageExtension}`;
      const imageFullPath = path.resolve(`${imagePath}/${imageGenName}`);
      fs.writeFile(imageFullPath, req.file.buffer, function (err) {
        if (err) throw new CustomError();
      });
    }
    if (req.file && employee?.image) {
      const imagePath = path.join(path.resolve('./'), '/public/images');
      const imageFullPath = path.resolve(`${imagePath}/${employee?.image}`);
      fs.exists(imageFullPath, function (exists) {
        if (exists) {
          fs.unlinkSync(imageFullPath);
        }
      });
    }
    await Employee.update(
      { image: imageGenName },
      {
        where: {
          id: employee?.id,
        },
      },
    );
    res.json({ success: true });
  }
  async authEmployee(req, res) {
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
    const findEmployee = await Employee.findOne({
      attributes: { exclude: ['password'] },
      where: { active: true, idService: tokenData.id },
      include: {
        model: PostSubdivision,
        attributes: ['postId', 'subdivisionId'],
      },
    });
    if (!findEmployee) {
      throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
    }
    const findPost = await Post.findOne({
      where: {
        active: true,
        id: findEmployee?.postSubdivision?.postId,
      },
    });
    if (!findPost) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }
    const findSubdivision = await Subdivision.findOne({
      where: {
        active: true,
        id: findEmployee?.postSubdivision?.subdivisionId,
      },
    });
    if (!findSubdivision) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    res.json({ ...findEmployee.toJSON(), post: findPost?.name, subdivision: findSubdivision?.name });
  }
  async getEmployeeUser(req, res) {
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
    let employeeExtand = {};
    const employee = await Employee.findOne({
      where: {
        idService: tokenData?.id,
      },
      include: [
        {
          model: PostSubdivision,
        },
        {
          model: Subdivision,
        },
      ],
    });

    const findPost = await Post.findOne({
      where: { id: employee?.postSubdivision?.postId },
    });
    const findSubdivision = await Subdivision.findOne({
      where: { id: employee?.postSubdivision?.subdivisionId },
    });
    employeeExtand = { ...employee.toJSON(), post: findPost?.name, subdivision: findSubdivision?.name };
    res.json(employeeExtand);
  }
  async getEmployee(req, res) {
    const { id } = req.params;
    let employeeExtand = {};
    const employee = await Employee.findOne({
      where: {
        id,
      },
      include: [
        {
          model: PostSubdivision,
          include: [
            {
              model: Category,
            },
          ],
        },
        { model: Category },
      ],
    });

    const findPost = await Post.findOne({
      where: { id: employee?.postSubdivision?.postId },
    });
    const findSubdivision = await Subdivision.findOne({
      where: { id: employee?.postSubdivision?.subdivisionId },
    });
    employeeExtand = { ...employee.toJSON(), post: findPost?.name, subdivision: findSubdivision?.name };
    res.json(employeeExtand);
  }
  async getEmployees(req, res) {
    const { page, search, subdivision, dateCalendar } = req.query;
    let employeeListWithPost = [];
    let findPostSubdivisions = [];
    let formatDateCalendar;
    let empolyeesCount = 0;
    let employeeHistoryIds = [];
    let requestSubdivison;
    if (dateCalendar) {
      formatDateCalendar = moment(dateCalendar);
      if (formatDateCalendar.isValid()) {
        formatDateCalendar = formatDateCalendar.set('date', 1).format('YYYY-MM-DD');
      } else {
        throw new CustomError(400, TypeError.PARAMS_INVALID);
      }
    }
    if (subdivision) {
      findPostSubdivisions = await PostSubdivision.findAll({
        where: { subdivisionId: subdivision },
      });
      // console.log(formatDateCalendar);
      if (dateCalendar) {
        const findEmployeeHistory = await EmployeeHistory.findAll({
          where: {
            // dateIn: formatDateCalendar.toString(),
            postSubdivisionId: {
              $in: findPostSubdivisions?.map((findPostSub) => findPostSub?.id),
            },
          },
        });
        employeeHistoryIds = findEmployeeHistory?.map((historyId) => historyId?.employeeId);
      }
      requestSubdivison = await Subdivision.findOne({
        where: { id: subdivision },
      });
    }

    if (findPostSubdivisions?.length == 0 && typeof subdivision == 'string' && subdivision != '0') {
      res.json({ pages: empolyeesCount, list: employeeListWithPost });
    } else {
      empolyeesCount = await Employee.count({
        ...(findPostSubdivisions?.length !== 0 && {
          where: {
            postSubdivisionId: {
              $in: findPostSubdivisions?.map((findPostSub) => findPostSub?.id),
            },
          },
        }),
      });
      const employeeFilterInclude = [
        {
          model: PostSubdivision,
          as: 'postSubdivision',
          ...(typeof subdivision == 'string' && {
            include: [
              {
                model: Category,
                as: 'categories',
              },
            ],
          }),
        },
        { model: Category },
      ];
      if (formatDateCalendar) {
        employeeFilterInclude.push({
          model: WorkCalendar,
          where: {
            date: formatDateCalendar,
            subdivisionId: subdivision,
          },
          required: false,
        });
      }

      const employeeFilter = {
        ...(search && {
          where: {
            $or: [{ firstName: { $like: search + '%' } }, { lastName: { $like: search + '%' } }, { idService: { $startWith: search + '%' } }],
          },
        }),
        ...(findPostSubdivisions?.length !== 0 && {
          where: {
            ...(employeeHistoryIds?.length !== 0
              ? {
                  $or: [
                    { id: { $in: employeeHistoryIds } },
                    {
                      postSubdivisionId: {
                        $in: findPostSubdivisions?.map((findPostSub) => findPostSub?.id),
                      },
                    },
                  ],
                }
              : {
                  postSubdivisionId: {
                    $in: findPostSubdivisions?.map((findPostSub) => findPostSub?.id),
                  },
                }),
          },
        }),
        include: employeeFilterInclude,
      };
      if (formatDateCalendar) {
        employeeFilter.where.active = true;
      }
      const employeeList = await Employee.findAll(page == 0 ? employeeFilter : paginate(employeeFilter, { page, pageSize: 10 }));

      for (let testItem of employeeList) {
        let findCats = [];
        const findCat = await Post.findOne({
          where: { id: testItem?.postSubdivision?.postId },
        });
        const findSubdiv = await Subdivision.findOne({
          where: { id: testItem?.postSubdivision?.subdivisionId },
        });

        if (typeof subdivision == 'string') {
          const findSubdivCat = await CategoryPostSubdivision.findAll({
            where: {
              postSubdivisionId: testItem?.postSubdivisionId,
              active: true,
            },
          });
          findCats = await Category.findAll({
            where: {
              id: {
                $in: findSubdivCat?.map((findCatItem) => findCatItem?.categoryId),
              },
            },
          });
        }
        let timeTable = [];
        try {
          const timeTableResponse = await axios.get(`http://${process.env.API_1C_USER_3}:${process.env.API_1C_PASSWORD_3}@192.168.240.196/zup_pay/hs/Exch_LP/timesheet?id=${testItem?.idService}&date=${formatDateCalendar}T00:00:00`);
          timeTableResponse?.data?.map((itemTimeTalbe) => {
            itemTimeTalbe?.places_work?.map((itemPlacesWork) => {
              if (itemPlacesWork?.id_city === requestSubdivison?.idService) {
                itemPlacesWork?.work_periods?.map((itemWorkPeriods) => {
                  itemWorkPeriods?.time?.map((itemTime) => {
                    const itemMonthYearStr = itemTime?.date_time.substring(0, 7);
                    const currentMonthYearStr = formatDateCalendar.substring(0, 7);
                    if (itemMonthYearStr === currentMonthYearStr) {
                      timeTable.push(itemTime);
                    }
                  });
                });
              }
            });
          });
        } catch (error) {
          console.error('TABLE ERROR');
        }

        employeeListWithPost.push({ ...testItem.toJSON(), post: findCat?.name, subdivision: findSubdiv?.name, cats: findCats, timeTable });
      }

      res.json({ pages: empolyeesCount, list: employeeListWithPost });
    }
  }

  async syncEmployees(req, res) {
    const dataFrom1C = await axios.get(`http://${process.env.API_1C_USER}:${process.env.API_1C_PASSWORD}@192.168.240.196/zup_pay/hs/Exch_LP/ListEmployees`);
    // const dataFrom1C = testSyncEmployees;
    const formatData = formatEmployees(dataFrom1C.data);
    // const formatData = formatEmployees(dataFrom1C);
    await upsertEmployees(formatData);
    await disableEmployees(formatData);

    res.json(formatData);
  }

  async importEmployeesWorkTable(req, res) {
    const { login, pass, date, id_city } = req.query;

    const passCheck = await bcrypt.compare(pass, process.env.EXPORT_COEFF_PASS);
    const loginCheck = await bcrypt.compare(login, process.env.EXPORT_COEFF_LOGIN);

    if (!passCheck || !loginCheck) {
      throw new CustomError(400, TypeError.LOGIN_ERROR);
    }
    const resultArr = await getWorkTableBySubdivisonAndDate(date, id_city);
    res.json(resultArr);
    // const findEmployeeHistory = await EmployeeHistory.findAll({
    //   where: { employeeExternalId: id },
    // });
    // let resultArr = [];
    // const findEmployeeHistoryCurrentMonth = findEmployeeHistory?.find((hist) => moment(hist?.dateIn).format('YYYY-MM') === dateMomentPass?.format('YYYY-MM'));
    // if (findEmployeeHistoryCurrentMonth) {
    //   const findPostSubdivision = await PostSubdivision.findOne({
    //     where: {
    //       id: findEmployeeHistoryCurrentMonth?.postSubdivisionId,
    //     },
    //   });
    //   const findSubdivion = await Subdivision.findOne({
    //     where: {
    //       id: findPostSubdivision?.subdivisionId,
    //     },
    //   });

    //   for (let dateItem of allDaysGenerate) {
    //     let result = {
    //       id: findEmployees?.idService,
    //       employ: findEmployeeHistoryCurrentMonth.employeeExternalId,
    //       id_city: findSubdivion?.idService,
    //       date_time: dateItem,
    //       time_start: '00:00',
    //       time_finish: '00:00',
    //       hours: 0,
    //       vih: true,
    //       ot: false,
    //       bl: false,
    //     };
    //     resultArr.push(result);
    //   }
    //   res.json(resultArr);
    // } else {
    //   res.json([]);
    // }
  }
  async getCoeff(req, res) {
    const { login, pass } = req.query;
    const passCheck = await bcrypt.compare(pass, process.env.EXPORT_COEFF_PASS);
    const loginCheck = await bcrypt.compare(login, process.env.EXPORT_COEFF_LOGIN);

    if (!passCheck || !loginCheck) {
      throw new CustomError(400, TypeError.LOGIN_ERROR);
    }
    const findEmployees = await Employee.findAll({
      attributes: ['idService', 'coefficient'],
    });
    res.json(findEmployees);
  }
  async updateEmployee(req, res) {
    const { id, coefficient, categoryPostSubdivisionIds, postSubdivisionId } = req.body;
    const findEmployee = await Employee.findOne({ where: { idService: id } });
    if (!findEmployee) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    // const findCategoryPostSubdivisions = await CategoryPostSubdivision.findAll({
    //   where: {
    //     id: categoryPostSubdivisionIds,
    //   },
    // });

    // if (findCategoryPostSubdivisions?.length !== categoryPostSubdivisionIds?.length) {
    //   throw new CustomError(404, TypeError.NOT_FOUND);
    // }
    await CategoryEmployee.destroy({
      where: {
        employeeId: findEmployee?.id,
      },
    });
    for (let catPostSubdiv of categoryPostSubdivisionIds) {
      const catItem = {
        employeeId: findEmployee?.id,
        categoryId: catPostSubdiv,
      };
      await upsert({ ...catItem, active: true }, catItem);
    }

    // await CategoryEmployee.update(
    //   { active: true },
    //   {
    //     where: {
    //       employeeId: findEmployee?.id,
    //       categoryId: categoryPostSubdivisionIds,
    //     },
    //   },
    // );
    // await CategoryPostSubdivision.update(
    //   { active: false },
    //   {
    //     where: {
    //       postSubdivisionId,
    //       id: {
    //         $notIn: categoryPostSubdivisionIds,
    //       },
    //     },
    //   },
    // );
    await Employee.update(
      { coefficient },
      {
        where: {
          idService: id,
        },
      },
    );

    res.json({ success: true });
  }
  async loginEmployee(req, res) {
    const { login, password } = req.body;
    const findEmployee = await Employee.findOne({ where: { tel: login, active: true } });
    if (!findEmployee) {
      throw new CustomError(400, TypeError.LOGIN_ERROR);
    }
    const passCheck = await bcrypt.compare(password, findEmployee.password);
    if (!passCheck) {
      throw new CustomError(400, TypeError.LOGIN_ERROR);
    }
    const token = jwt.sign({ id: findEmployee.idService }, process.env.SECRET_TOKEN, { expiresIn: '1h' });
    res.json({ token: token });
  }
  async getAccountInfo(req, res) {
    const { idService, date } = req.query;
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
    });
    if (!employee) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    const commonData = await axios.get(`http://${process.env.API_1C_USER}:${process.env.API_1C_PASSWORD}@192.168.240.196/zup_pay/hs/Exch_LP/PayrollReport?ID=${idService}`);
    let tableResponse;
    let tableData = null;
    try {
      tableResponse = await axios.get(`
    http://${process.env.API_1C_USER_2}:${process.env.API_1C_PASSWORD_2}@192.168.240.196/UT11/hs/IntHRM/SalesMotivation?ID=${commonData?.data?.ID_UT11}&Date1=${date}T00:00:00&Date2=${date}T00:00:00
    
    `);
    } catch (error) {}
    if (tableResponse?.data) {
      tableData = tableResponse?.data;
    }
    res.json({ ...commonData.data, table: tableData });
  }

  async getEmployeeHistory(req, res) {
    const { date } = req.query;
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
    });
    const findEmployeeHistory = await EmployeeHistory.findAll({
      where: {
        employeeId: employee?.id,
      },
    });
    const findPostSubdivisions = await PostSubdivision.findAll({
      where: { id: findEmployeeHistory?.map((item) => item?.postSubdivisionId) },
    });
    const findSubdivision = await Subdivision.findAll({
      where: { id: findPostSubdivisions?.map((item) => item?.subdivisionId) },
    });

    res.json(findSubdivision);
  }
  async getСompetitionProducts(req, res) {
    const { date, subdiv, employee, competition } = req.query;

    const getCompListReq = await axios.get(`
    http://ExchangeHRMUser:k70600ga@192.168.242.20/zup_dev/hs/Exch_LP/competition_detailed_result?date=${date}&id=${employee}`);

    const filterCompeptitionProducts = getCompListReq?.data?.find?.((prodItem) => prodItem?.id_competition == competition && prodItem?.id_city == subdiv);
    if (filterCompeptitionProducts?.mass_product) {
      res.json(filterCompeptitionProducts?.mass_product);
    } else {
      res.json([]);
    }
  }
  async updateEmployeesAccess(req, res) {
    const { removed, added, type } = req.body;
    let condAccess;
    if (!removed && !added) {
      throw new CustomError();
    }
    if (type == 'content') {
      condAccess = 'editorContent';
      if (removed?.length >= 1) {
        await Employee.update(
          {
            [condAccess]: false,
          },
          { where: { id: { $in: removed?.map((itemRemoved) => itemRemoved?.id) } } },
        );
      }
      if (added?.length >= 1) {
        await Employee.update(
          {
            [condAccess]: true,
          },
          { where: { id: { $in: added?.map((itemAdded) => itemAdded?.id) } } },
        );
      }
    } else if (type == 'workTable') {
      const resultAdded = added.reduce(function (r, a) {
        r[a.id] = r[a.id] || [];
        r[a.id].push(a);
        return r;
      }, Object.create(null));

      Object.keys(resultAdded).forEach(async function (key) {
        for (let item of resultAdded[key]) {
          await AccessWorkTableEmployee.upsert({
            employeeId: item?.id,
            subdivisionId: item?.subdivision,
          });
        }
      });
      const resultRemoved = removed.reduce(function (r, a) {
        r[a.id] = r[a.id] || [];
        r[a.id].push(a);
        return r;
      }, Object.create(null));

      Object.keys(resultRemoved).forEach(async function (key) {
        for (let item of resultRemoved[key]) {
          await AccessWorkTableEmployee.destroy({
            where: {
              employeeId: item?.id,
              subdivisionId: item?.subdivision,
            },
          });
        }
      });
      // const allSubdivEmployee = added?.filter((addedItem) => addedItem?.id == itemAdded.id);
      // for (let singleAddedEmployee of allSubdivEmployee) {
      //   await AccessWorkTableEmployee.upsert({
      //     employeeId: singleAddedEmployee?.id,
      //     subdivisionId: singleAddedEmployee?.subdivision,
      //   });
      // }
    } else {
      throw new CustomError();
    }

    res.json(true);
  }
  async getEmployeesAccess(req, res) {
    const { type } = req.query;
    let cond;
    if (type == 'content') {
      cond = { editorContent: true };
      const employeesAccess = await Employee.findAll({
        where: cond,
        include: [
          {
            model: PostSubdivision,
          },
        ],
      });
      const viewEmployeeAccess = employeesAccess?.map((itemEmpl) => ({ id: itemEmpl.id, subdivision: itemEmpl.postSubdivision?.subdivisionId }));
      res.json(viewEmployeeAccess);
    } else if (type == 'workTable') {
      let viewEmployeeWorkTable = [];
      const employeesAccess = await Employee.findAll({
        include: [
          {
            model: Subdivision,
            required: true,
          },
        ],
      });
      employeesAccess?.map((itemEmpl) => {
        itemEmpl?.subdivisions?.map((itemSubdiv) => {
          viewEmployeeWorkTable.push({ id: itemEmpl.id, subdivision: itemSubdiv.id });
        });
      });
      res.json(viewEmployeeWorkTable);
    } else {
      throw new CustomError();
    }
  }

  async getСompetitionList(req, res) {
    const { date, subdiv } = req.query;

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
      include: [
        {
          model: PostSubdivision,
        },
      ],
    });
    if (!employee) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    const getCompListReq = await axios.get(`
   http://ExchangeHRMUser:k70600ga@192.168.242.20/zup_dev/hs/Exch_LP/competition_result?date=${date}`);

    const findAllSubdiv = await Subdivision.findAll();

    const filterCompeptitionBySubdiv = getCompListReq?.data?.[0]?.mass_competition
      ?.filter((itemComp) => {
        const findSubdiv = itemComp?.mass_city?.find((itemMass) => itemMass?.id_city == subdiv);
        if (findSubdiv) {
          return true;
        }
      })
      ?.map((itemComp) => {
        itemComp.mass_city = itemComp?.mass_city
          ?.map((itemMass) => {
            const findSubdivMass = findAllSubdiv?.find((itemAllSubdiv) => {
              itemAllSubdiv?.isService == itemMass?.id_city;
            });

            itemMass.name_city = findSubdivMass?.name;
            return itemMass;
          })
          .sort((a, b) => a.place_city - b.place_city);
        return itemComp;
      });
    res.json(filterCompeptitionBySubdiv);
  }
  async getСompetitionListEmployee(req, res) {
    const { date, subdiv } = req.query;

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
      include: [
        {
          model: PostSubdivision,
        },
      ],
    });
    if (!employee) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }
    const getCompListReq = await axios.get(`
   http://ExchangeHRMUser:k70600ga@192.168.242.20/zup_dev/hs/Exch_LP/competition_result?date=${date}&id_city=${subdiv}&collect_users=true`);

    const isManager = process.env.MANAGER_POST_ID == employee?.postSubdivision?.postId;
    const employeesFromCompetition = [];
    getCompListReq?.data?.[0]?.mass_user?.map((itemComp) => {
      itemComp?.mass_id?.map((itemMass) => employeesFromCompetition.push(itemMass.id));
    });
    const findEmployeesFromCompetition = await Employee.findAll({
      where: {
        idService: { $in: employeesFromCompetition },
      },
      attributes: ['idService', 'firstName', 'lastName'],
    });
    const filterCompeptitionBySubdiv = getCompListReq?.data?.[0]?.mass_user?.map((itemComp) => {
      itemComp.mass_id = itemComp?.mass_id
        ?.map((itemMass) => {
          const findSubdivMass = findEmployeesFromCompetition?.find((itemAllSubdiv) => itemAllSubdiv?.idService == itemMass?.id);

          itemMass.name = `${findSubdivMass?.firstName} ${findSubdivMass?.lastName}`;
          return itemMass;
        })
        .sort((a, b) => a.place - b.place);
      return itemComp;
    });
    res.json(filterCompeptitionBySubdiv);
  }
}

function formatEmployees(data) {
  return data
    .filter(({ ID, last_name, first_name, tel, ID_post, ID_city }) => ID && last_name && first_name && !isNaN(parseInt(tel)) && parseInt(tel) !== 0 && ID_post && ID_city)
    .map(({ ID, last_name, first_name, tel, ID_post, ID_city, Main_Place, Date_In, Date_Out, employee }) => ({ idService: ID, firstName: first_name, lastName: last_name, tel: tel, postId: ID_post, subdivisionId: ID_city, Main_Place, Date_In, employeeExternal: employee, Date_Out }));
}
async function upsertEmployees(data) {
  const activeCats = await Category.findAll({
    where: {
      active: true,
    },
  });
  for (let item of data) {
    await checkEmployees(item, activeCats);
  }
}

async function disableEmployees(data) {
  let ids = data.map(({ idService }) => idService);
  await Employee.update(
    { active: false },
    {
      where: {
        idService: {
          $notIn: ids,
        },
      },
    },
  );
  return Employee.update(
    { active: true },
    {
      where: {
        id: 1,
      },
    },
  );
}
async function checkEmployees({ idService, firstName, lastName, tel, postId, subdivisionId, Main_Place, employeeExternal, Date_In, Date_Out }, categories) {
  let isNewPostSubdivision = false;
  let postSubdivision;
  let role = 'user';
  let coefficient = 1;
  let employee = {
    active: true,
    idService,
    firstName,
    lastName,
    role,
    tel,
  };
  let createdEmployee;
  const findSubdivision = await Subdivision.findOne({
    where: { idService: subdivisionId, active: true },
  });
  if (!findSubdivision) {
    return await Employee.update(
      { active: false },
      {
        where: { idService },
      },
    );
  }
  const findPost = await Post.findOne({
    where: { idService: postId, active: true },
  });
  if (!findPost) {
    return await Employee.update(
      { active: false },
      {
        where: { idService },
      },
    );
  }
  postSubdivision = await PostSubdivision.findOne({
    where: { postId: findPost?.id, subdivisionId: findSubdivision?.id },
  });
  if (!postSubdivision) {
    isNewPostSubdivision = true;
    postSubdivision = await PostSubdivision.create({
      postId: findPost?.id,
      subdivisionId: findSubdivision?.id,
    });
  }

  const findEmployee = await Employee.findOne({
    where: { idService },
  });

  if (!findEmployee) {
    let categoryEmployeeList = [];
    let categoryPostSubdivisionList = [];
    const plainPassword = getFirstPartUUID(idService);
    const password = bcrypt.hashSync(plainPassword, 3);
    employee = { ...employee, password, postSubdivisionId: postSubdivision?.id };

    createdEmployee = await Employee.create(employee);
    for (let categoryItem of categories) {
      const catItem = {
        employeeId: createdEmployee?.id,
        categoryId: categoryItem?.id,
        active: false,
      };
      const categoryPostSubdivision = {
        categoryId: categoryItem?.id,
        postSubdivisionId: postSubdivision?.id,
        active: false,
      };
      categoryEmployeeList.push(catItem);
      categoryPostSubdivisionList.push(categoryPostSubdivision);
    }
    await CategoryEmployee.bulkCreate(categoryEmployeeList);
    await CategoryPostSubdivision.bulkCreate(categoryPostSubdivisionList);
  }
  if (Main_Place) {
    if (findEmployee?.postSubdivisionId === postSubdivision?.id) {
      coefficient = findEmployee?.coefficient;
    }
    employee = { ...employee, coefficient, postSubdivisionId: postSubdivision?.id };

    await Employee.update(employee, {
      where: { idService },
    });
  }

  const findEmployeeHistory = await EmployeeHistory.findOne({
    where: {
      employeeExternalId: employeeExternal,
    },
  });
  if (!findEmployeeHistory) {
    await EmployeeHistory.create({
      employeeId: findEmployee?.id ? findEmployee?.id : createdEmployee?.id,
      postSubdivisionId: postSubdivision?.id,
      dateIn: Date_In,
      dateOut: Date_Out,
      employeeExternalId: employeeExternal,
    });
  }
}
function upsert(values, condition) {
  return CategoryEmployee.findOne({ where: condition }).then(function (obj) {
    // update
    if (obj) return obj.update(values);
    // insert
    return CategoryEmployee.create(values);
  });
}

async function getWorkTableBySubdivisonAndDate(date, id_city) {
  const dateMomentPass = moment(date);
  if (!dateMomentPass.isValid()) {
    throw new CustomError(400);
  }
  const mounthPass = parseInt(dateMomentPass.format('M').toString()) - 1;
  const yearPass = parseInt(dateMomentPass.format('YYYY').toString());
  const allDaysGenerate = getDaysInMonth(mounthPass, yearPass);
  const findSubdivion = await Subdivision.findOne({
    where: {
      idService: id_city,
    },
  });
  const findPostSubdivisions = await PostSubdivision.findAll({
    where: {
      subdivisionId: findSubdivion?.id,
    },
  });

  const findEmployees = await Employee.findAll({
    where: { postSubdivisionId: { $in: findPostSubdivisions?.map((postSub) => postSub?.id) }, active: true },
    include: {
      model: WorkCalendar,
      where: {
        date: dateMomentPass.format('YYYY-MM-DD'),
        subdivisionId: findSubdivion?.id,
      },
      required: false,
    },
  });

  let resultArr = [];
  for (let oneEmployee of findEmployees) {
    const parsedWorkCalendars = oneEmployee?.workCalendars?.map((itemWorkCalend) => ({ ...itemWorkCalend, calendarData: itemWorkCalend.calendarData ? JSON.parse(itemWorkCalend.calendarData) : itemWorkCalend.calendarData }));
    const findEmployeeHistory = await EmployeeHistory.findAll({
      where: { employeeId: oneEmployee?.id, postSubdivisionId: { $in: findPostSubdivisions?.map((postSub) => postSub?.id) } },
    });
    for (let dateItem of allDaysGenerate) {
      const findEmployeeHistoryCurrentMonth = findEmployeeHistory?.find((hist) => moment(hist?.dateIn).format('YYYY-MM').toString() === dateMomentPass?.format('YYYY-MM').toString());
      let result = {
        id: oneEmployee?.idService,
        employ: '0000',
        id_city: id_city,
        date_time: dateItem,
        date_in: new Date('0001-01-01'),
        date_out: new Date('0001-01-01'),
        type_time: '',
        hours: 0,
        time_start: '00:00',
        time_finish: '00:00',
      };
      if (findEmployeeHistoryCurrentMonth) {
        result.employ = findEmployeeHistoryCurrentMonth?.employeeExternalId;
        result.date_in = moment(findEmployeeHistoryCurrentMonth?.dateIn).toDate();
        result.date_out = moment(findEmployeeHistoryCurrentMonth?.dateOut).toDate();
      } else {
        result.employ = findEmployeeHistory?.[0]?.employeeExternalId;
      }
      parsedWorkCalendars?.map((itemWorkCal) => {
        itemWorkCal?.calendarData?.map((itemWorkCalNested) => {
          if (moment(itemWorkCalNested?.date).format('YYYY-MM-DD').toString() === moment(dateItem).format('YYYY-MM-DD').toString()) {
            if (itemWorkCalNested?.type === 'work') {
              result.type_time = 'work';
              if (itemWorkCalNested?.startTime) {
                result.time_start = moment(itemWorkCalNested?.startTime).format('hh:mm').toString();
              }
              if (itemWorkCalNested?.endTime) {
                result.time_finish = moment(itemWorkCalNested?.endTime).format('hh:mm').toString();
              }
              if (itemWorkCalNested?.startTime && itemWorkCalNested?.endTime) {
                const diffTime = parseFloat(
                  moment
                    .utc(moment(itemWorkCalNested?.endTime).set('seconds', 0).diff(moment(itemWorkCalNested?.startTime).set('seconds', 0)))
                    .format('H.mm')
                    .toString(),
                );
                result.hours = diffTime;
                console.log(diffTime);
              }
            } else if (itemWorkCalNested?.type === 'sick') {
              result.type_time = 'bol';
            } else if (itemWorkCalNested?.type === 'vacation') {
              result.type_time = 'otp';
            } else if (itemWorkCalNested?.type === 'day-off') {
              result.type_time = 'vih';
            }
          }
        });
      });
      if (!result?.employ) {
        console.log('NOT FOUND EMPLOYEE ', result);
      }
      resultArr.push(result);
    }
  }
  return resultArr;
}
module.exports = { employeeController: new EmployeeController(), getWorkTableBySubdivisonAndDate };
