// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Login and Registration
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    const adminSidebar = document.getElementById('admin-sidebar');
    const menuToggle = document.querySelectorAll('.menu-toggle');
    const closeSidebar = document.querySelectorAll('.close-sidebar');

    // User Dashboard
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li[data-page]');
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pages = document.querySelectorAll('.page');
    const quickLinks = document.querySelectorAll('.link-item[data-page]');
    const wireTransferBtn = document.getElementById('wire-transfer-btn');
    const interBankBtn = document.getElementById('inter-bank-btn');
    const domesticTransferForm = document.getElementById('domestic-transfer-form');
    const interBankForm = document.getElementById('inter-bank-form');
    const wireTransferForm = document.getElementById('wire-transfer-form');
    const passwordForm = document.getElementById('password-form');
    const supportForm = document.getElementById('support-form');
    const calculateLoanBtn = document.getElementById('calculate-loan');

    // Admin Dashboard
    const adminSidebarMenuItems = document.querySelectorAll('.sidebar-menu li[data-admin-page]');
    const adminPages = document.querySelectorAll('.admin-page');
    const adminFundForm = document.getElementById('admin-fund-form');
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('add-user-modal');
    const viewUserModal = document.getElementById('view-user-modal');
    const addUserForm = document.getElementById('add-user-form');
    const closeModal = document.querySelectorAll('.close-modal');

    // Initialize data from server or create default if not exists
    let users = [];
    let transactions = [];

    // Fetch data from server
    function fetchData() {
        // Fetch users
        fetch('/api/users')
            .then(response => response.json())
            .then(data => {
                users = data;
                updateUI();
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                // If server is not available, use local storage
                const storedUsers = localStorage.getItem('users');
                if (storedUsers) {
                    users = JSON.parse(storedUsers);
                } else {
                    // Create default admin user if no data exists
                    users = [
                        {
                            id: 1,
                            name: 'Admin',
                            email: 'admin@safenest.com',
                            password: 'admin123',
                            balance: 5000000000.00,
                            isAdmin: true,
                            accountNumber: '1234567890',
                            status: 'active',
                            createdAt: new Date().toISOString()
                        }
                    ];
                    localStorage.setItem('users', JSON.stringify(users));
                }
                updateUI();
            });

        // Fetch transactions
        fetch('/api/transactions')
            .then(response => response.json())
            .then(data => {
                transactions = data;
                updateUI();
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
                // If server is not available, use local storage
                const storedTransactions = localStorage.getItem('transactions');
                if (storedTransactions) {
                    transactions = JSON.parse(storedTransactions);
                } else {
                    transactions = [];
                    localStorage.setItem('transactions', JSON.stringify(transactions));
                }
                updateUI();
            });
    }

    // Save data to server or local storage
    function saveData() {
        // Save users
        fetch('/api/users/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(users),
        })
        .catch(error => {
            console.error('Error saving users:', error);
            localStorage.setItem('users', JSON.stringify(users));
        });

        // Save transactions
        fetch('/api/transactions/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactions),
        })
        .catch(error => {
            console.error('Error saving transactions:', error);
            localStorage.setItem('transactions', JSON.stringify(transactions));
        });
    }

    // Update UI based on current data
    function updateUI() {
        const currentUser = getCurrentUser();
        
        if (currentUser) {
            if (currentUser.isAdmin) {
                updateAdminDashboard();
            } else {
                updateUserDashboard(currentUser);
            }
        }
    }

    // Get current logged in user
    function getCurrentUser() {
        const userJson = sessionStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }

    // Event Listeners
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'flex';
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'flex';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Try to login via API
            fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(user => {
                loginSuccess(user);
            })
            .catch(error => {
                console.error('Error logging in:', error);
                // If API fails, try local login
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    loginSuccess(user);
                } else {
                    alert('Invalid email or password');
                }
            });
        });
    }

    function loginSuccess(user) {
        loginContainer.style.display = 'none';
        
        if (user.isAdmin) {
            adminDashboard.style.display = 'flex';
            updateAdminDashboard();
        } else {
            dashboardContainer.style.display = 'flex';
            updateUserDashboard(user);
        }
        
        // Store current user in session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            // Try to register via API
            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: fullname, email, password }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then(user => {
                alert('Registration successful! Please login.');
                registerContainer.style.display = 'none';
                loginContainer.style.display = 'flex';
            })
            .catch(error => {
                console.error('Error registering:', error);
                // If API fails, try local registration
                
                // Check if email already exists
                if (users.some(u => u.email === email)) {
                    alert('Email already registered');
                    return;
                }
                
                // Generate random account number
                const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
                
                // Create new user
                const newUser = {
                    id: users.length + 1,
                    name: fullname,
                    email: email,
                    password: password,
                    balance: 0,
                    isAdmin: false,
                    accountNumber: accountNumber.toString(),
                    status: 'active',
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                saveData();
                
                // Switch to login
                registerContainer.style.display = 'none';
                loginContainer.style.display = 'flex';
                alert('Registration successful! Please login.');
            });
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            dashboardContainer.style.display = 'none';
            loginContainer.style.display = 'flex';
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            adminDashboard.style.display = 'none';
            loginContainer.style.display = 'flex';
        });
    }

    // Toggle sidebar
    menuToggle.forEach(toggle => {
        toggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            adminSidebar.classList.add('active');
        });
    });

    closeSidebar.forEach(close => {
        close.addEventListener('click', () => {
            sidebar.classList.remove('active');
            adminSidebar.classList.remove('active');
        });
    });

    // Page navigation
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        
        // Update navigation
        sidebarMenuItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId.replace('-page', '')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        navItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId.replace('-page', '')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
            sidebar.classList.remove('active');
        }
    }

    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page') + '-page';
            showPage(pageId);
        });
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page') + '-page';
            showPage(pageId);
        });
    });

    quickLinks.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page') + '-page';
            showPage(pageId);
        });
    });

    // Quick action buttons
    if (wireTransferBtn) {
        wireTransferBtn.addEventListener('click', () => {
            showPage('wire-transfer-page');
        });
    }

    if (interBankBtn) {
        interBankBtn.addEventListener('click', () => {
            showPage('inter-bank-page');
        });
    }

    // Transfer forms
    if (domesticTransferForm) {
        domesticTransferForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processTransfer('domestic-recipient', 'domestic-amount', 'domestic-description');
        });
    }

    if (interBankForm) {
        interBankForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processTransfer('bank-account', 'bank-amount', 'bank-description');
        });
    }

    if (wireTransferForm) {
        wireTransferForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processTransfer('wire-recipient', 'wire-amount', 'wire-description');
        });
    }

    function processTransfer(recipientField, amountField, descriptionField) {
        const recipient = document.getElementById(recipientField).value;
        const amount = parseFloat(document.getElementById(amountField).value);
        const description = document.getElementById(descriptionField).value || 'Transfer';
        
        // Get current user
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            alert('You must be logged in to make a transfer');
            return;
        }
        
        // Find recipient (by email or account number)
        const recipientUser = users.find(u => u.email === recipient || u.accountNumber === recipient);
        
        if (!recipientUser) {
            alert('Recipient not found');
            return;
        }
        
        if (currentUser.balance < amount) {
            alert('Insufficient funds');
            return;
        }
        
        // Update balances
        const currentUserIndex = users.findIndex(u => u.id === currentUser.id);
        const recipientIndex = users.findIndex(u => u.id === recipientUser.id);
        
        users[currentUserIndex].balance -= amount;
        users[recipientIndex].balance += amount;
        
        // Create transaction records
        const timestamp = new Date().toISOString();
        
        // Debit transaction for sender
        const debitTransaction = {
            id: transactions.length + 1,
            from: currentUser.email,
            fromAccount: currentUser.accountNumber,
            to: recipientUser.email,
            toAccount: recipientUser.accountNumber,
            amount: amount,
            type: 'debit',
            description: description,
            timestamp: timestamp,
            status: 'completed'
        };
        
        // Credit transaction for recipient
        const creditTransaction = {
            id: transactions.length + 2,
            from: currentUser.email,
            fromAccount: currentUser.accountNumber,
            to: recipientUser.email,
            toAccount: recipientUser.accountNumber,
            amount: amount,
            type: 'credit',
            description: description,
            timestamp: timestamp,
            status: 'completed'
        };
        
        transactions.push(debitTransaction, creditTransaction);
        
        // Update session storage
        sessionStorage.setItem('currentUser', JSON.stringify(users[currentUserIndex]));
        
        // Save data
        saveData();
        
        // Update UI
        updateUserDashboard(users[currentUserIndex]);
        
        alert('Transfer successful');
        
        // Reset form
        document.getElementById(recipientField).value = '';
        document.getElementById(amountField).value = '';
        document.getElementById(descriptionField).value = '';
    }

    // Password form
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            const currentUser = getCurrentUser();
            
            if (!currentUser) {
                alert('You must be logged in to change your password');
                return;
            }
            
            if (currentUser.password !== currentPassword) {
                alert('Current password is incorrect');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            // Update password
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            users[userIndex].password = newPassword;
            
            // Update session storage
            sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            
            // Save data
            saveData();
            
            alert('Password changed successfully');
            
            // Reset form
            passwordForm.reset();
        });
    }

    // Support form
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Your message has been sent. Our support team will contact you soon.');
            supportForm.reset();
        });
    }

    // Loan calculator
    if (calculateLoanBtn) {
        calculateLoanBtn.addEventListener('click', () => {
            const loanAmount = parseFloat(document.getElementById('loan-amount').value);
            const loanTerm = parseFloat(document.getElementById('loan-term').value);
            const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
            
            // Calculate monthly payment
            const monthlyRate = interestRate / 12;
            const totalPayments = loanTerm * 12;
            const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
            const totalPayment = monthlyPayment * totalPayments;
            const totalInterest = totalPayment - loanAmount;
            
            document.getElementById('monthly-payment').textContent = formatCurrency(monthlyPayment);
            document.getElementById('total-payment').textContent = formatCurrency(totalPayment);
            document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
        });
    }

    // Admin page navigation
    function showAdminPage(pageId) {
        adminPages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        
        // Update navigation
        adminSidebarMenuItems.forEach(item => {
            if (item.getAttribute('data-admin-page') === pageId.replace('-page', '')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
            adminSidebar.classList.remove('active');
        }
    }

    adminSidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = 'admin-' + item.getAttribute('data-admin-page') + '-page';
            showAdminPage(pageId);
        });
    });

    // Admin fund form
    if (adminFundForm) {
        adminFundForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userIdentifier = document.getElementById('fund-user-email').value;
            const amount = parseFloat(document.getElementById('fund-amount').value);
            const description = document.getElementById('fund-description').value || 'Admin Funding';
            
            // Get admin user
            const admin = getCurrentUser();
            
            if (!admin || !admin.isAdmin) {
                alert('Unauthorized');
                return;
            }
            
            // Find user to fund (by email or account number)
            const userToFund = users.find(u => u.email === userIdentifier || u.accountNumber === userIdentifier);
            
            if (!userToFund) {
                alert('User not found');
                return;
            }
            
            if (admin.balance < amount) {
                alert('Insufficient admin funds');
                return;
            }
            
            // Update balances
            const adminIndex = users.findIndex(u => u.id === admin.id);
            const userIndex = users.findIndex(u => u.id === userToFund.id);
            
            users[adminIndex].balance -= amount;
            users[userIndex].balance += amount;
            
            // Create transaction records
            const timestamp = new Date().toISOString();
            
            // Debit transaction for admin
            const debitTransaction = {
                id: transactions.length + 1,
                from: admin.email,
                fromAccount: admin.accountNumber,
                to: userToFund.email,
                toAccount: userToFund.accountNumber,
                amount: amount,
                type: 'debit',
                description: description,
                timestamp: timestamp,
                status: 'completed'
            };
            
            // Credit transaction for user
            const creditTransaction = {
                id: transactions.length + 2,
                from: admin.email,
                fromAccount: admin.accountNumber,
                to: userToFund.email,
                toAccount: userToFund.accountNumber,
                amount: amount,
                type: 'credit',
                description: description,
                timestamp: timestamp,
                status: 'completed'
            };
            
            transactions.push(debitTransaction, creditTransaction);
            
            // Update session storage
            sessionStorage.setItem('currentUser', JSON.stringify(users[adminIndex]));
            
            // Save data
            saveData();
            
            // Update dashboard
            updateAdminDashboard();
            
            alert('User funded successfully');
            
            // Reset form
            adminFundForm.reset();
        });
    }

    // Add user modal
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            addUserModal.classList.add('active');
        });
    }

    // Close modals
    closeModal.forEach(close => {
        close.addEventListener('click', () => {
            addUserModal.classList.remove('active');
            viewUserModal.classList.remove('active');
        });
    });

    // Add user form
    if (addUserForm) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('add-user-name').value;
            const email = document.getElementById('add-user-email').value;
            const password = document.getElementById('add-user-password').value;
            const balance = parseFloat(document.getElementById('add-user-balance').value) || 0;
            
            // Check if email already exists
            if (users.some(u => u.email === email)) {
                alert('Email already registered');
                return;
            }
            
            // Generate random account number
            const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
            
            // Create new user
            const newUser = {
                id: users.length + 1,
                name: name,
                email: email,
                password: password,
                balance: balance,
                isAdmin: false,
                accountNumber: accountNumber.toString(),
                status: 'active',
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            
            // If admin added initial balance, create a transaction
            if (balance > 0) {
                const admin = getCurrentUser();
                
                if (admin && admin.isAdmin) {
                    const timestamp = new Date().toISOString();
                    
                    // Debit transaction for admin
                    const debitTransaction = {
                        id: transactions.length + 1,
                        from: admin.email,
                        fromAccount: admin.accountNumber,
                        to: newUser.email,
                        toAccount: newUser.accountNumber,
                        amount: balance,
                        type: 'debit',
                        description: 'Initial funding',
                        timestamp: timestamp,
                        status: 'completed'
                    };
                    
                    // Credit transaction for user
                    const creditTransaction = {
                        id: transactions.length + 2,
                        from: admin.email,
                        fromAccount: admin.accountNumber,
                        to: newUser.email,
                        toAccount: newUser.accountNumber,
                        amount: balance,
                        type: 'credit',
                        description: 'Initial funding',
                        timestamp: timestamp,
                        status: 'completed'
                    };
                    
                    transactions.push(debitTransaction, creditTransaction);
                    
                    // Update admin balance
                    const adminIndex = users.findIndex(u => u.id === admin.id);
                    users[adminIndex].balance -= balance;
                    
                    // Update session storage
                    sessionStorage.setItem('currentUser', JSON.stringify(users[adminIndex]));
                }
            }
            
            // Save data
            saveData();
            
            // Update dashboard
            updateAdminDashboard();
            
            // Close modal
            addUserModal.classList.remove('active');
            
            alert('User added successfully');
            
            // Reset form
            addUserForm.reset();
        });
    }

    // Update user dashboard
    function updateUserDashboard(user) {
        // Update balance
        document.getElementById('balance').textContent = formatCurrency(user.balance);
        document.getElementById('ledger-balance').textContent = formatCurrency(user.balance);
        document.getElementById('sidebar-balance').textContent = formatCurrency(user.balance);
        
        // Update username
        document.getElementById('username').textContent = user.name;
        document.getElementById('sidebar-username').textContent = user.name;
        
        // Update account number
        document.getElementById('sidebar-account-number').textContent = `Acc No: ${user.accountNumber}`;
        
        // Update profile page
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-account-number').textContent = user.accountNumber;
        document.getElementById('profile-fullname').textContent = user.name;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-date').textContent = formatDate(user.createdAt);
        
        // Update card holder name
        if (document.getElementById('card-holder-name')) {
            document.getElementById('card-holder-name').textContent = user.name;
        }
        
        // Update transactions
        updateTransactions(user);
        
        // Update statement
        updateStatement(user);
        
        // Update history
        updateHistory(user);
    }

    // Update admin dashboard
    function updateAdminDashboard() {
        const admin = getCurrentUser();
        
        if (!admin || !admin.isAdmin) {
            return;
        }
        
        // Update admin balance
        document.getElementById('admin-balance').textContent = formatCurrency(admin.balance);
        
        // Update stats
        const nonAdminUsers = users.filter(u => !u.isAdmin);
        document.getElementById('total-users').textContent = nonAdminUsers.length;
        document.getElementById('total-transactions').textContent = transactions.length;
        
        const transfers = transactions.filter(t => t.type === 'debit' && t.from !== 'admin@safenest.com');
        document.getElementById('total-transfers').textContent = transfers.length;
        
        const adminFunding = transactions.filter(t => t.type === 'debit' && t.from === 'admin@safenest.com');
        const totalFunded = adminFunding.reduce((sum, t) => sum + t.amount, 0);
        document.getElementById('total-funds').textContent = formatCurrency(totalFunded);
        
        // Update recent users table
        const recentUsersTable = document.getElementById('recent-users-table');
        if (recentUsersTable) {
            recentUsersTable.innerHTML = '';
            
            nonAdminUsers.slice(0, 5).forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.accountNumber}</td>
                    <td>${formatCurrency(user.balance)}</td>
                    <td><span class="status ${user.status}">${user.status}</span></td>
                    <td>
                        <div class="user-actions">
                            <button class="action-btn fund-btn-small" data-email="${user.email}">Fund</button>
                            <button class="action-btn view-btn" data-id="${user.id}">View</button>
                        </div>
                    </td>
                `;
                recentUsersTable.appendChild(tr);
            });
            
            // Add event listeners to buttons
            addUserActionListeners();
        }
        
        // Update recent transactions table
        const recentTransactionsTable = document.getElementById('recent-transactions-table');
        if (recentTransactionsTable) {
            recentTransactionsTable.innerHTML = '';
            
            transactions.slice(0, 5).forEach(transaction => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatDate(transaction.timestamp)}</td>
                    <td>${transaction.from}</td>
                    <td>${transaction.to}</td>
                    <td>${formatCurrency(transaction.amount)}</td>
                    <td>${transaction.type}</td>
                    <td><span class="status ${transaction.status}">${transaction.status}</span></td>
                `;
                recentTransactionsTable.appendChild(tr);
            });
        }
        
        // Update users table
        const usersTableBody = document.getElementById('users-table-body');
        if (usersTableBody) {
            usersTableBody.innerHTML = '';
            
            nonAdminUsers.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.accountNumber}</td>
                    <td>${formatCurrency(user.balance)}</td>
                    <td><span class="status ${user.status}">${user.status}</span></td>
                    <td>
                        <div class="user-actions">
                            <button class="action-btn fund-btn-small" data-email="${user.email}">Fund</button>
                            <button class="action-btn view-btn" data-id="${user.id}">View</button>
                            <button class="action-btn edit-btn" data-id="${user.id}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${user.id}">Delete</button>
                        </div>
                    </td>
                `;
                usersTableBody.appendChild(tr);
            });
            
            // Add event listeners to buttons
            addUserActionListeners();
        }
        
        // Update funding transactions table
        const fundingTransactionsTable = document.getElementById('funding-transactions-table');
        if (fundingTransactionsTable) {
            fundingTransactionsTable.innerHTML = '';
            
            adminFunding.slice(0, 5).forEach(transaction => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatDate(transaction.timestamp)}</td>
                    <td>${transaction.to}</td>
                    <td>${formatCurrency(transaction.amount)}</td>
                    <td>${transaction.description}</td>
                    <td><span class="status ${transaction.status}">${transaction.status}</span></td>
                `;
                fundingTransactionsTable.appendChild(tr);
            });
        }
        
        // Update all transactions table
        const transactionsTableBody = document.getElementById('transactions-table-body');
        if (transactionsTableBody) {
            transactionsTableBody.innerHTML = '';
            
            transactions.forEach(transaction => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatDate(transaction.timestamp)}</td>
                    <td>${transaction.from}</td>
                    <td>${transaction.to}</td>
                    <td>${formatCurrency(transaction.amount)}</td>
                    <td>${transaction.type}</td>
                    <td>${transaction.description}</td>
                    <td><span class="status ${transaction.status}">${transaction.status}</span></td>
                `;
                transactionsTableBody.appendChild(tr);
            });
        }
    }

    // Add event listeners to user action buttons
    function addUserActionListeners() {
        // Fund buttons
        document.querySelectorAll('.fund-btn-small').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.getAttribute('data-email');
                document.getElementById('fund-user-email').value = email;
                showAdminPage('admin-fund-page');
            });
        });
        
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = parseInt(btn.getAttribute('data-id'));
                const user = users.find(u => u.id === userId);
                
                if (user) {
                    document.getElementById('view-user-name').textContent = user.name;
                    document.getElementById('view-user-email').textContent = user.email;
                    document.getElementById('view-user-account').textContent = user.accountNumber;
                    document.getElementById('view-user-balance').textContent = formatCurrency(user.balance);
                    document.getElementById('view-user-status').textContent = user.status;
                    document.getElementById('view-user-date').textContent = formatDate(user.createdAt);
                    
                    // Set button text based on status
                    const toggleStatusBtn = document.querySelector('.toggle-status-btn');
                    toggleStatusBtn.textContent = user.status === 'active' ? 'Deactivate' : 'Activate';
                    
                    // Add event listeners to buttons
                    document.querySelector('.edit-user-btn').setAttribute('data-id', user.id);
                    document.querySelector('.fund-user-btn').setAttribute('data-email', user.email);
                    document.querySelector('.toggle-status-btn').setAttribute('data-id', user.id);
                    
                    viewUserModal.classList.add('active');
                }
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = parseInt(btn.getAttribute('data-id'));
                const user = users.find(u => u.id === userId);
                
                if (user) {
                    // Populate form
                    document.getElementById('add-user-name').value = user.name;
                    document.getElementById('add-user-email').value = user.email;
                    document.getElementById('add-user-password').value = user.password;
                    document.getElementById('add-user-balance').value = user.balance;
                    
                    // Change form submission behavior
                    const addUserForm = document.getElementById('add-user-form');
                    addUserForm.setAttribute('data-edit-id', user.id);
                    
                    // Change button text
                    document.querySelector('.add-user-btn').textContent = 'Update User';
                    
                    addUserModal.classList.add('active');
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = parseInt(btn.getAttribute('data-id'));
                
                if (confirm('Are you sure you want to delete this user?')) {
                    // Remove user
                    users = users.filter(u => u.id !== userId);
                    
                    // Save data
                    saveData();
                    
                    // Update dashboard
                    updateAdminDashboard();
                    
                    alert('User deleted successfully');
                }
            });
        });
    }

    // Update transactions in user dashboard
    function updateTransactions(user) {
        const creditTransactions = document.getElementById('credit-transactions');
        const debitTransactions = document.getElementById('debit-transactions');
        
        if (!creditTransactions || !debitTransactions) return;
        
        creditTransactions.innerHTML = '';
        debitTransactions.innerHTML = '';
        
        // Get user's transactions
        const userCredits = transactions.filter(t => t.to === user.email && t.type === 'credit');
        const userDebits = transactions.filter(t => t.from === user.email && t.type === 'debit');
        
        // Display credit transactions
        if (userCredits.length === 0) {
            creditTransactions.innerHTML = '<div class="transaction-item"><p>No credit transactions</p></div>';
        } else {
            userCredits.slice(0, 3).forEach(transaction => {
                const div = document.createElement('div');
                div.className = 'transaction-item';
                div.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-icon">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${transaction.from === 'admin@safenest.com' ? 'Admin' : transaction.from}</h4>
                            <span class="transaction-status credited">Credited</span>
                        </div>
                    </div>
                    <div class="transaction-amount credit">${formatCurrency(transaction.amount)}</div>
                `;
                creditTransactions.appendChild(div);
            });
        }
        
        // Display debit transactions
        if (userDebits.length === 0) {
            debitTransactions.innerHTML = '<div class="transaction-item"><p>No debit transactions</p></div>';
        } else {
            userDebits.slice(0, 3).forEach(transaction => {
                const div = document.createElement('div');
                div.className = 'transaction-item';
                div.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-icon">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${transaction.to}</h4>
                            <span class="transaction-status processing">Processing</span>
                        </div>
                    </div>
                    <div class="transaction-amount debit">-${formatCurrency(transaction.amount)}</div>
                `;
                debitTransactions.appendChild(div);
            });
        }
    }

    // Update statement
    function updateStatement(user) {
        const statementTableBody = document.getElementById('statement-table-body');
        
        if (!statementTableBody) return;
        
        statementTableBody.innerHTML = '';
        
        // Get user's transactions
        const userTransactions = transactions.filter(t => t.to === user.email || t.from === user.email);
        
        // Sort by date (newest first)
        userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        let balance = user.balance;
        
        // Display transactions in reverse order (oldest first)
        userTransactions.reverse().forEach(transaction => {
            const isCredit = transaction.to === user.email;
            const amount = isCredit ? transaction.amount : -transaction.amount;
            
            // Calculate running balance
            if (!isCredit) {
                balance -= transaction.amount;
            } else {
                balance += transaction.amount;
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(transaction.timestamp)}</td>
                <td>${transaction.description}</td>
                <td>${isCredit ? formatCurrency(transaction.amount) : '-' + formatCurrency(transaction.amount)}</td>
                <td>${isCredit ? 'Credit' : 'Debit'}</td>
                <td>${formatCurrency(balance)}</td>
            `;
            statementTableBody.appendChild(tr);
        });
    }

    // Update history
    function updateHistory(user) {
        const historyTableBody = document.getElementById('history-table-body');
        
        if (!historyTableBody) return;
        
        historyTableBody.innerHTML = '';
        
        // Get user's transactions
        const userTransactions = transactions.filter(t => t.to === user.email || t.from === user.email);
        
        // Sort by date (newest first)
        userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        userTransactions.forEach(transaction => {
            const isCredit = transaction.to === user.email;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(transaction.timestamp)}</td>
                <td>${transaction.description}</td>
                <td>${isCredit ? formatCurrency(transaction.amount) : '-' + formatCurrency(transaction.amount)}</td>
                <td>${isCredit ? 'Credit' : 'Debit'}</td>
                <td><span class="status ${transaction.status}">${transaction.status}</span></td>
            `;
            historyTableBody.appendChild(tr);
        });
    }

    // Helper functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    // Check if user is logged in (page refresh)
    function checkLoggedInUser() {
        const currentUser = getCurrentUser();
        
        if (currentUser) {
            loginContainer.style.display = 'none';
            
            if (currentUser.isAdmin) {
                adminDashboard.style.display = 'flex';
                updateAdminDashboard();
            } else {
                dashboardContainer.style.display = 'flex';
                updateUserDashboard(currentUser);
            }
        }
    }

    // Initialize
    fetchData();
    checkLoggedInUser();
});

// Declare variables
const pages = document.querySelectorAll('.page');
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu-item');
const navItems = document.querySelectorAll('.nav-item');
const sidebar = document.getElementById('sidebar');
const adminPages = document.querySelectorAll('.admin-page');
const adminSidebarMenuItems = document.querySelectorAll('.admin-sidebar-menu-item');
const adminSidebar = document.getElementById('admin-sidebar');

// Modify the page navigation function to ensure only one page is shown at a time
function showPage(pageId) {
    // Hide all pages first
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update sidebar menu items
    sidebarMenuItems.forEach(item => {
        if (item.getAttribute('data-page') === pageId.replace('-page', '')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update bottom navigation
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === pageId.replace('-page', '')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        sidebar.classList.remove('active');
    }
}

// Modify the admin page navigation function to ensure only one page is shown at a time
function showAdminPage(pageId) {
    // Hide all admin pages first
    adminPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected admin page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update admin sidebar menu items
    adminSidebarMenuItems.forEach(item => {
        if (item.getAttribute('data-admin-page') === pageId.replace('admin-', '').replace('-page', '')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        adminSidebar.classList.remove('active');
    }
}

// Make sure only one page is active when the app loads
document.addEventListener('DOMContentLoaded', function() {
    // Ensure only dashboard page is visible initially for user
    const userPages = document.querySelectorAll('.page');
    userPages.forEach(page => {
        page.classList.remove('active');
    });
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        dashboardPage.classList.add('active');
    }
    
    // Ensure only dashboard page is visible initially for admin
    const adminPages = document.querySelectorAll('.admin-page');
    adminPages.forEach(page => {
        page.classList.remove('active');
    });
    const adminDashboardPage = document.getElementById('admin-dashboard-page');
    if (adminDashboardPage) {
        adminDashboardPage.classList.add('active');
    }
});