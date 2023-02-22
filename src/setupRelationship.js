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

  // db.employees.belongsToMany(db.employeePositions, { through: 'employeesEmployeePosition', foreignKey: 'employeeePositionId' });
  // db.employeePositions.belongsToMany(db.employees, { through: 'employeesEmployeePosition', foreignKey: 'employeeId' });

  // db.articles.belongsToMany(db.employeePositions, { through: 'articlesEmployeePositions', foreignKey: 'articleId' });
  // db.employeePositions.belongsToMany(db.articles, { through: 'articlesEmployeePositions', foreignKey: 'employeePositionId' });

  // db.articles.belongsToMany(db.marks, { through: 'articlesMarks', foreignKey: 'articleId' });
  // db.marks.belongsToMany(db.articles, { through: 'articlesMarks', foreignKey: 'markId' });

  
  db.employees.belongsToMany(db.employeePositions, { through: { model: db.employeesEmployeePositions, unique: false }, foreignKey: 'employeePositionId' });
  db.employeePositions.belongsToMany(db.employees, { through: { model: db.employeesEmployeePositions, unique: false }, foreignKey: 'employeeId' });

  db.articles.belongsToMany(db.employeePositions, { through: { model: db.articlesEmployeePositions, unique: false }, foreignKey: 'EmployeePositionId' });
  db.employeePositions.belongsToMany(db.articles, { through: { model: db.articlesEmployeePositions, unique: false }, foreignKey: 'articleId' });

  db.articles.belongsToMany(db.marks, { through: { model: db.articlesMarks, unique: false }, foreignKey: 'articleId' });
  db.marks.belongsToMany(db.articles, { through: { model: db.articlesMarks, unique: false }, foreignKey: 'markId' });

  db.sections.hasMany(db.articles);
  db.articles.belongsTo(db.sections);

  db.sectionGroups.hasMany(db.sections);
  db.sections.belongsTo(db.sectionGroups);
};

module.exports = setupRelationship;
