function reset(db) {
  db.newsTypes.bulkCreate([
    { id: 1, name: 'Новость' },
    { id: 2, name: 'Обучение' },
  ]);
  // ADMIN
  db.subdivisions.bulkCreate([{ id: 1, idService: '1111', name: 'Администрация', active: 1 }]);
  db.posts.bulkCreate([{ id: 1, idService: '1111', name: 'Администрация', active: 1 }]);
  db.postSubdivisions.bulkCreate([{ id: 1, active: 1, postId: 1, subdivisionId: 1 }]);
  db.employees.bulkCreate([{ id: 1, idService: '1111', firstName: 'Админ', lastName: 'Админ', tel: 'cenalom', active: 1, role: 'admin', postSubdivisionId: 1, password: '$2a$04$9zkmyMhf5o43.YepZivpS.jrKaKidS5YuA1TC2Omd3Ttaw2IuSSdK' }]);

  // TEST USER
  db.subdivisions.bulkCreate([{ id: 2, idService: 'e5b7f72b-4f36-11ec-80cb-a0d3c1ef2117', name: 'Красноярск (Тестовый) СО', active: 1 }]);
  db.posts.bulkCreate([{ id: 2, idService: '68e71c50-31c8-11ea-93c4-d89d672bfba0', name: 'Менеджер', active: 1 }]);
  db.postSubdivisions.bulkCreate([{ id: 2, active: 1, postId: 2, subdivisionId: 2 }]);
  db.employees.bulkCreate([{ id: 1, idService: '41fbe332-63bf-11ec-80cb-a0d3c1ef2117', firstName: 'Иван', lastName: 'Иванов', tel: '12345', active: 1, role: 'user', postSubdivisionId: 1, password: '$2a$04$9zkmyMhf5o43.YepZivpS.jrKaKidS5YuA1TC2Omd3Ttaw2IuSSdK' }]);
}

module.exports = reset;
