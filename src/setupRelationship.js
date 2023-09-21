const dataTypes = require("sequelize/lib/data-types");
const { DataTypes } = require("sequelize/lib/sequelize");

const setupRelationship = (db) => {
  db.posts.belongsToMany(db.subdivisions, { through: { model: db.postSubdivisions, as: 'postSubdivision', unique: false }, foreignKey: 'postId' });
  db.subdivisions.belongsToMany(db.posts, { through: { model: db.postSubdivisions, as: 'postSubdivision', unique: false }, foreignKey: 'subdivisionId' });

  db.postSubdivisions.hasMany(db.employees);
  db.employees.belongsTo(db.postSubdivisions);

  db.categories.belongsToMany(db.postSubdivisions, { through: { model: db.categoryPostSubdivisions, unique: false }, foreignKey: 'categoryId' });
  db.postSubdivisions.belongsToMany(db.categories, { through: { model: db.categoryPostSubdivisions, unique: false }, foreignKey: 'postSubdivisionId' });

  db.categoryPostSubdivisions.hasMany(db.testings);
  db.testings.belongsTo(db.categoryPostSubdivisions);

  db.posts.belongsToMany(db.news, { through: { model: db.newsPosts, unique: false }, foreignKey: 'postId' });
  db.news.belongsToMany(db.posts, { through: { model: db.newsPosts, unique: false }, foreignKey: 'newsId' });

  db.categories.belongsToMany(db.testings, { through: { model: db.categoryTestings, unique: false }, foreignKey: 'categoryId' });
  db.testings.belongsToMany(db.categories, { through: { model: db.categoryTestings, unique: false }, foreignKey: 'testingId' });

  db.newsTypes.hasMany(db.newsFilters);
  db.newsFilters.belongsTo(db.newsTypes);

  db.testingFilters.hasMany(db.testings);
  db.testings.belongsTo(db.testingFilters);

  db.newsFilters.hasMany(db.news);
  db.news.belongsTo(db.newsFilters);

  db.employees.belongsToMany(db.categories, { through: { model: db.categoryEmployees, unique: false }, foreignKey: 'employeeId' });
  db.categories.belongsToMany(db.employees, { through: { model: db.categoryEmployees, unique: false }, foreignKey: 'categoryId' });

  db.news.belongsToMany(db.categories, { through: { model: db.newsCategories, unique: false }, foreignKey: 'newsId' });
  db.categories.belongsToMany(db.news, { through: { model: db.newsCategories, unique: false }, foreignKey: 'categoryId' });

  db.employees.belongsToMany(db.workCalendar, { through: { model: db.employeeWorkCalendar, unique: false }, foreignKey: 'employeeId' });
  db.workCalendar.belongsToMany(db.employees, { through: { model: db.employeeWorkCalendar, unique: false }, foreignKey: 'workCalendarId' });

  db.employees.belongsToMany(db.postSubdivisions, { through: { model: db.employeeHistories, unique: false }, foreignKey: 'employeeId' });
  db.postSubdivisions.belongsToMany(db.employees, { through: { model: db.employeeHistories, unique: false }, foreignKey: 'postSubdivisionId' });

  db.subdivisions.hasMany(db.workCalendar);
  db.workCalendar.belongsTo(db.subdivisions);


  db.articles.belongsToMany(db.posts, { through: { model: db.articlesPosts, unique: false }, foreignKey: 'articleId'});
  db.posts.belongsToMany(db.articles, { through: { model: db.articlesPosts, unique: false }, foreignKey: 'postId'});

  db.articles.belongsToMany(db.marks, { through: { model: db.articlesMarks, unique: false }, foreignKey: 'articleId' });
  db.marks.belongsToMany(db.articles, { through: { model: db.articlesMarks, unique: false }, foreignKey: 'markId' });

  db.sections.hasMany(db.articles);
  db.articles.belongsTo(db.sections);

  db.sectionGroups.hasMany(db.sections);
  db.sections.belongsTo(db.sectionGroups);

  db.articles.hasMany(db.articleFiles);
  db.articleFiles.belongsTo(db.articles);

  db.employees.belongsToMany(db.subdivisions, { through: { model: db.accessWorkTableEmployee, unique: false }, foreignKey: 'employeeId' });
  db.subdivisions.belongsToMany(db.employees, { through: { model: db.accessWorkTableEmployee, unique: false }, foreignKey: 'subdivisionId' });

  db.employees.belongsToMany(db.subdivisions, { through: { model: db.accessBalanceEmployee, unique: false }, foreignKey: 'employeeId' });
  db.subdivisions.belongsToMany(db.employees, { through: { model: db.accessBalanceEmployee, unique: false }, foreignKey: 'subdivisionId' });

  db.employees.belongsToMany(db.employees, { through: { model: db.prePaymentEmployee, unique: false }, foreignKey: 'managerId', as: 'children' });
  db.employees.belongsToMany(db.employees, { through: { model: db.prePaymentEmployee, unique: false }, foreignKey: 'employeeId', as: 'parents' });

  db.subdivisions.hasOne(db.subdivisionWorkTimeTemplates);
  db.subdivisionWorkTimeTemplates.belongsTo(db.subdivisions);

};

module.exports = setupRelationship;
