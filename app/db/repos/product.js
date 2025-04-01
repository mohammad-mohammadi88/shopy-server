const db = require("../createDatabase");

class Product {

    create(data) {
        return new Promise((reslove , reject) => {
            let sql ='INSERT INTO products (title, category , body , price , user_id , created_at) VALUES (?,?,?,?,?,?)'
    
            db.run(sql, [ data.title, data.category , data.body , data.price , data?.user_id , Date.now() ], function (err, innerResult) {
                if (err) return reject(err);
        
                reslove();
            });   

        })
    }

    findBy(field , value) {
        return new Promise((resolve , reject) => {
            db.get(`SELECT * FROM products WHERE ${field} = ?`, value , function(err , product) {
                if(err) return reject(err);
    
                resolve(product);
            });
        });
    }

    getUserProductsWithPaginate(page = 1 , per_page = 1,user_id) {
        let offset = (page - 1) * per_page;

        return new Promise((resolve , reject) => {
            db.all(`SELECT * FROM products WHERE user_id = ? LIMIT ?, ?`, [  user_id,offset , per_page] , function(err , products) {
                if(err) return reject(err);
    
                resolve(products);
            });
        });
    }

    userProductCount(user_id) {
        return new Promise((resolve , reject) => {
            db.get(`SELECT COUNT(*) as total_products FROM products WHERE user_id = ?`,[user_id] , function(err , product) {
                if(err) return reject(err);
                
                resolve(product?.total_products);
            });
        });
    }

    getWithPaginate(page = 1 , per_page = 1 ) {
        let offset = (page - 1) * per_page;

        return new Promise((resolve , reject) => {
            db.all(`SELECT * FROM products LIMIT ?, ? `, [ offset , per_page] , function(err , products) {
                if(err) return reject(err);
    
                resolve(products);
            });
        });
    }
    getWithSameCategoryWithPaginate(category, page = 1 , per_page = 1 ) {
        let offset = (page - 1) * per_page;

        return new Promise((resolve , reject) => {
            db.all(`SELECT * FROM products WHERE category = ? LIMIT ?, ? `, [category, offset , per_page] , function(err , products) {
                if(err) return reject(err);
    
                resolve(products);
            });
        });
    }
    async getProductsIdWithPaginate(page = 1 , per_page = 1 ) {
        let offset = (page - 1) * per_page;

        return new Promise((resolve , reject) => {
            db.all(`SELECT id FROM products LIMIT ?, ? `, [ offset , per_page] , function(err , products) {
                if(err) return reject(err);
    
                resolve(products);
            });
        }).then((items)=>{
            const response = items.map((item)=>Object.values(item)[0])
            return response
        })
    }

    count() {
        return new Promise((resolve , reject) => {
            db.get(`SELECT COUNT(*) as total_products FROM products` , function(err , product) {
                if(err) return reject(err);
                
                resolve(product?.total_products);
            });
        });
    }
    getSameCategoryCount(category) {
        return new Promise((resolve , reject) => {
            db.get(`SELECT COUNT(*) as total_products FROM products WHERE category = ?`,[category] , function(err , product) {
                if(err) return reject(err);
                
                resolve(product?.total_products);
            });
        });
    }

    delete(id) {
        return new Promise((resolve , reject) => {
            db.all(`DELETE FROM products WHERE id = ? `, [id] , function(err) {
                if(err) return reject(err);

                resolve(true);
            });
    
        });
    }

    async update(id , data) {
        const product = await this.findBy("id",id)
        let fieldMustUpdate = Object.keys(data).map(item => `${item}=$${item}` ).join(',');
        let fieldData = {};
        Object.keys(data).forEach(item => fieldData[`$${item}`] = data[item] ?? product[item] )

        return new Promise((resolve , reject) => {

            db.run(`UPDATE products SET ${fieldMustUpdate} WHERE id = $id` , { $id : id  , ...fieldData} , function(err) {
                if(err) return reject(err)

                resolve(true)
            })
        });
    }
}


module.exports = new Product();