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
};

module.exports = setupRelationship;
