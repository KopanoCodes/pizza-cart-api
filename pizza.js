function pizzaShop() {
    return {
        title: 'Pizza Cart API',
        pizzas: [],
        featuredPizzas: [],
        cartPizzas: [],
        historicalOrdersList: [],
        username: 'Kopano31',
        cartId: '',
        cartTotal: 0.00,
        paymentAmount: 0,
        message: '',
        change: 0,
        showHistoricalOrders: false,
        msgStyle: false,
        isLoggedIn: false,

        login() {
            if (this.username.length > 2) {
                localStorage.setItem('username', this.username);
                this.createCart();
                this.isLoggedIn = true;
            } else {
                alert('Username must be at least 3 characters long');
            }
        },

        logout() {
            if (confirm('Are you sure you want to logout?')) {
                this.username = '';
                this.cartId = '';
                this.isLoggedIn = false;
                this.cartPizzas = [];
                this.cartTotal = 0.00;
                this.paymentAmount = 0;
                this.change = 0;
                localStorage.clear();
            }
        },

        createCart() {
            if (!this.username) return;

            const storedCartId = localStorage.getItem('cartId');
            if (storedCartId) {
                this.cartId = storedCartId;
                this.showCartData();
            } else {
                const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                axios.get(createCartURL)
                    .then(result => {
                        this.cartId = result.data.cart_code;
                        localStorage.setItem('cartId', this.cartId);
                        this.showCartData();
                    });
            }
        },

        getCart() {
            const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
            return axios.get(getCartURL);
        },

        addPizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                "cart_code": this.cartId,
                "pizza_id": pizzaId
            });
        },

        removePizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                "cart_code": this.cartId,
                "pizza_id": pizzaId
            });
        },

        pay(amount) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                "cart_code": this.cartId,
                amount
            });
        },

        showCartData() {
            this.getCart().then(result => {
                const cartData = result.data;
                this.cartPizzas = cartData.pizzas;
                this.cartTotal = parseFloat(cartData.total);
            });
        },

        fetchHistoricalOrders() {
            const historicalOrdersURL = `https://pizza-api.projectcodex.net/api/pizza-cart/orders/${this.username}`;
            axios.get(historicalOrdersURL)
                .then(result => {
                    console.log(result.data.orders); // Log the response
                    this.historicalOrdersList = result.data.orders;
                })
                .catch(error => {
                    console.error('Error fetching historical orders:', error);
                });
        },
        

        addPizzaToCart(pizzaId) {
            this.addPizza(pizzaId)
                .then(() => {
                    this.showCartData();
                });
        },

        removePizzaFromCart(pizzaId) {
            this.removePizza(pizzaId)
                .then(() => {
                    this.showCartData();
                });
        },

        payForCart() {
            this.pay(this.paymentAmount)
                .then(result => {
                    if (result.data.status === 'failure') {
                        this.message = result.data.message;
                        this.msgStyle = true;
                        setTimeout(() => { this.message = ''; }, 3000);
                    } else {
                        this.message = 'Payment Successful!';
                        this.msgStyle = false;

                        if (Number(this.paymentAmount) >= Number(this.cartTotal)) {
                            this.change = this.paymentAmount - this.cartTotal;
                        } else {
                            this.change = 0;
                        }

                        setTimeout(() => {
                            this.message = '';
                            this.change = 0;
                            this.cartPizzas = [];
                            this.cartTotal = 0.00;
                            this.cartId = '';
                            this.paymentAmount = 0;
                            localStorage.removeItem('cartId');
                            this.createCart();
                        }, 6000);
                    }
                });
        },

        getSizeClass(index) {
            return index % 2 === 0 ? 'pizza large' : 'pizza medium';
        },

        getImageWidth(index) {
            return index % 2 === 0 ? '300' : '200';
        },

        init() {
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                this.username = storedUsername;
                this.isLoggedIn = true;
            }

            axios
                .get('https://pizza-api.projectcodex.net/api/pizzas')
                .then(result => {
                    this.pizzas = result.data.pizzas;
                    this.featuredPizzas = this.pizzas.slice(0, 3);
                });

            if (this.isLoggedIn) {
                this.createCart();
            }
        }
    };
}
