const db = require("../createDatabase");

class User {

    create(data) {
        return new Promise((reslove , reject) => {
            let sql = 'INSERT INTO users (name, isAdmin, phone, created_at) VALUES (?,?,?,?)'
            let createUser = [ data.name, data.isAdmin, data.phone, Date.now() ]
            db.run(sql, createUser , function (err, innerResult) {
                if (err) return reject(err);
        
                reslove();
            });   

        })
    }

    findBy(field , email) {
        return new Promise((resolve , reject) => {

            db.get(`SELECT * FROM users WHERE ${field} = ?`, email , function(err , user) {
                if(err) return reject(err);
    
                resolve(user);
            });
    
        });
    }

    findOtherBy(field , email, id) {
        return new Promise((resolve , reject) => {

            db.get(`SELECT * FROM users WHERE ${field} = ? AND  NOT id = ?`, [email,id] , function(err , user) {
                if(err) return reject(err);
    
                resolve(user);
            });
    
        });
    }

    delete(id) {
        return new Promise((resolve , reject) => {
            db.all(`DELETE FROM users WHERE id = ? `, [id] , function(err) {
                if(err) return reject(err);

                resolve(true);
            });
    
        });
    }

    count() {
        return new Promise((resolve , reject) => {
            db.get(`SELECT COUNT(*) as total_users FROM users` , function(err , product) {
                if(err) return reject(err);
                
                resolve(product?.total_users);
            });
        });
    }

    getUsersWithPaginate(page = 1 , per_page = 1) {
        let offset = (page - 1) * per_page;

        return new Promise((resolve , reject) => {
            db.all(`SELECT * FROM users LIMIT ?, ?`, [ offset , per_page] , function(err , user) {
                if(err) return reject(err);
    
                resolve(user);
            });
    
        });
    }

    async update(id , data) {
        const user = await this.findBy('id',id)
        let fieldMustUpdate = Object.keys(data).map(item => `${item}=$${item}` ).join(',');
        let fieldData = {};
        Object.keys(data).forEach(item => fieldData[`$${item}`] = data[item] ?? user[item] )

        return new Promise((resolve , reject) => {

            db.run(`UPDATE users SET ${fieldMustUpdate} WHERE id = $id` , { $id : id  , ...fieldData} , function(err) {
                if(err) return reject(err)

                resolve()
            })
        });
    }
}

module.exports = new User();