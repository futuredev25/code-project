const supabase = window.supabaseClient;
// ========== CONFIGURATION ==========
const ADMIN_CODE = "123456";
let isAdmin = false;
let productsDB = [];
let categoriesDB = [];
const DB_KEY = 'theroyce_menu_db';

// Images par défaut
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

// Stockage des images temporaires
let tempImages = {
    newCategory: null,
    newProduct: null,
    editCategory: null,
    editProduct: null
};

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Site The Royce chargé');
    
    initAdminSystem();
    initMenuSystem();
    loadMenuData();
    initAnimations();
    initPhotoUpload();
});

// ========== INITIALISATION UPLOAD PHOTO ==========
function initPhotoUpload() {
    // Photo nouvelle catégorie
    const newCategoryPhoto = document.getElementById('newCategoryPhoto');
    const newCategoryPreview = document.getElementById('newCategoryPreview');
    const newCategoryLabel = newCategoryPhoto ? newCategoryPhoto.previousElementSibling : null;
    
    if (newCategoryPhoto && newCategoryLabel) {
        newCategoryLabel.addEventListener('click', function() {
            newCategoryPhoto.click();
        });
        
        newCategoryPhoto.addEventListener('change', function(e) {
            handlePhotoUpload(e, newCategoryPreview, 'newCategory');
        });
    }
    
    // Photo nouveau produit
    const newProductPhoto = document.getElementById('newProductPhoto');
    const newProductPreview = document.getElementById('newProductPreview');
    const newProductLabel = newProductPhoto ? newProductPhoto.previousElementSibling : null;
    
    if (newProductPhoto && newProductLabel) {
        newProductLabel.addEventListener('click', function() {
            newProductPhoto.click();
        });
        
        newProductPhoto.addEventListener('change', function(e) {
            handlePhotoUpload(e, newProductPreview, 'newProduct');
        });
    }
    
    // Photo modification catégorie
    const editCategoryPhoto = document.getElementById('editCategoryPhoto');
    const editCategoryPreview = document.getElementById('editCategoryPreview');
    const editCategoryLabel = editCategoryPhoto ? editCategoryPhoto.previousElementSibling : null;
    
    if (editCategoryPhoto && editCategoryLabel) {
        editCategoryLabel.addEventListener('click', function() {
            editCategoryPhoto.click();
        });
        
        editCategoryPhoto.addEventListener('change', function(e) {
            handlePhotoUpload(e, editCategoryPreview, 'editCategory');
        });
    }
    
    // Photo modification produit
    const editProductPhoto = document.getElementById('editProductPhoto');
    const editProductPreview = document.getElementById('editProductPreview');
    const editProductLabel = editProductPhoto ? editProductPhoto.previousElementSibling : null;
    
    if (editProductPhoto && editProductLabel) {
        editProductLabel.addEventListener('click', function() {
            editProductPhoto.click();
        });
        
        editProductPhoto.addEventListener('change', function(e) {
            handlePhotoUpload(e, editProductPreview, 'editProduct');
        });
    }
}

function handlePhotoUpload(event, previewElement, type) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.match('image.*')) {
        showNotification('Veuillez sélectionner une image valide (JPEG, PNG, etc.) ❌', 'error');
        return;
    }
    
    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('L\'image est trop volumineuse (max 2MB) ❌', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Stocker l'image temporairement
        tempImages[type] = e.target.result;
        
        // Afficher la prévisualisation
        if (previewElement) {
            previewElement.innerHTML = `
                <img src="${e.target.result}" alt="Prévisualisation">
                <div class="photo-upload-info">
                    <i class="fas fa-check-circle"></i> Image chargée (${(file.size/1024).toFixed(1)} KB)
                </div>
            `;
            previewElement.classList.add('active');
        }
        
        showNotification('Image chargée avec succès ✅', 'success');
    };
    
    reader.onerror = function() {
        showNotification('Erreur lors du chargement de l\'image ❌', 'error');
    };
    
    reader.readAsDataURL(file);
}

function resetPhotoPreview(previewElement) {
    if (previewElement) {
        previewElement.innerHTML = '';
        previewElement.classList.remove('active');
    }
}

// ========== CHARGEMENT DES DONNÉES ==========
function loadMenuData() {
    try {
        const savedDB = localStorage.getItem(DB_KEY);
        
        if (savedDB) {
            const parsedDB = JSON.parse(savedDB);
            if (parsedDB.products && parsedDB.categories) {
                productsDB = parsedDB.products;
                categoriesDB = parsedDB.categories;
                console.log(`✅ ${productsDB.length} produits et ${categoriesDB.length} catégories chargés`);
            } else {
                initializeDefaultData();
            }
        } else {
            initializeDefaultData();
        }
        
        displayCategories();
        
    } catch (error) {
        console.error('❌ Erreur de chargement:', error);
        initializeDefaultData();
    }
}

function initializeDefaultData() {
    // Définir les catégories par défaut
    categoriesDB = [
        {
            id: 1,
            name: "Spécialités Chocolat",
            color: "#6B4423",
            image: DEFAULT_CATEGORY_IMAGE,
            type: "chocolat"
        },
        {
            id: 2,
            name: "Spécialités Pistache",
            color: "#93C572",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            type: "pistache"
        },
        {
            id: 3,
            name: "Fusion Royce",
            color: "linear-gradient(135deg, #6B4423, #93C572)",
            image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            type: "fusion"
        },
        {
            id: 4,
            name: "Boissons",
            color: "#8B5A2B",
            image: "https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            type: "boissons"
        }
    ];
    
    // Produits par défaut (DESCRIPTION SUPPRIMÉE)
    productsDB = [
        {
            id: 1,
            name: "خلطبيطه",
            price: "10.000 DT",
            description: "", // Description supprimée
            category: 1,
            ingredients: ["Chocolat Guanaja 70%", "Crème pistache", "Praliné croustillant", "Or edible"],
            tags: ["Signature", "Best-seller"],
            image: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            createdAt: "2024-01-15T10:00:00.000Z"
        },
        {
            id: 2,
            name: "Éclair Pistache d'Or",
            price: "7.800 DT",
            description: "", // Description supprimée
            category: 2,
            ingredients: ["Pistache de Bronte", "Crème pâtissière", "Pâte à choux", "Glaçage doré"],
            tags: ["Pistache Premium", "Artisanal"],
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            createdAt: "2024-01-15T10:00:00.000Z"
        },
        {
            id: 3,
            name: "Forêt Noire Royce",
            price: "14.200 DT",
            description: "", // Description supprimée
            category: 3,
            ingredients: ["Chocolat 70%", "Crème pistache", "Griottes", "Biscuit cacao"],
            tags: ["Exclusif", "Création Maison"],
            image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            createdAt: "2024-01-15T10:00:00.000Z"
        },
        {
            id: 4,
            name: "Cappuccino Pistache",
            price: "5.500 DT",
            description: "", // Description supprimée
            category: 4,
            ingredients: ["Café arabica", "Lait entier", "Sirop pistache", "Chocolat râpé"],
            tags: ["Chaud", "Signature"],
            image: "https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            createdAt: "2024-01-15T10:00:00.000Z"
        }
    ];
    
    saveMenuData();
}

function saveMenuData() {
    try {
        const dbObject = {
            version: '1.1',
            lastUpdate: new Date().toISOString(),
            products: productsDB,
            categories: categoriesDB
        };
        
        localStorage.setItem(DB_KEY, JSON.stringify(dbObject));
        console.log(`💾 Données sauvegardées: ${productsDB.length} produits, ${categoriesDB.length} catégories`);
        return true;
        
    } catch (error) {
        console.error('❌ Erreur de sauvegarde:', error);
        showNotification('Erreur lors de la sauvegarde des données ❌', 'error');
        return false;
    }
}

// ========== AFFICHAGE CATÉGORIES ==========
function displayCategories() {
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = '';
    
    if (categoriesDB.length === 0) {
        categoriesGrid.innerHTML = `
            <div class="category-loading" style="grid-column: 1 / -1;">
                <i class="fas fa-utensils"></i>
                <h3>Pas de catégories</h3>
                <p>Ajoutez des catégories via le panneau administrateur</p>
            </div>
        `;
        return;
    }
    
    categoriesDB.forEach(category => {
        const categoryProducts = productsDB.filter(p => p.category === category.id);
        
        const categoryElement = document.createElement('a');
        categoryElement.className = 'category-card';
        categoryElement.href = '#';
        categoryElement.dataset.categoryId = category.id;
        
        // Déterminer l'icône selon le type
        let icon = 'fa-utensils';
        if (category.type === 'chocolat') icon = 'fa-cookie-bite';
        else if (category.type === 'pistache') icon = 'fa-seedling';
        else if (category.type === 'fusion') icon = 'fa-crown';
        else if (category.type === 'boissons') icon = 'fa-mug-hot';
        
        const categoryImage = category.image || DEFAULT_CATEGORY_IMAGE;
        
        categoryElement.innerHTML = `
            <div class="category-image" style="background-image: url('${categoryImage}');">
                <div class="category-overlay">
                    <div class="category-icon-fixed ${category.type || 'default'}">
                        <i class="fas ${icon}"></i>
                    </div>
                </div>
            </div>
            <div class="category-info">
                <h3>${category.name}</h3>
                <div class="category-count">${categoryProducts.length} produit${categoryProducts.length !== 1 ? 's' : ''}</div>
            </div>
        `;
        
        categoryElement.addEventListener('click', function(e) {
            e.preventDefault();
            showCategoryProducts(category.id);
        });
        
        categoriesGrid.appendChild(categoryElement);
    });
}

function showCategoryProducts(categoryId) {
    const category = categoriesDB.find(c => c.id === categoryId);
    if (!category) return;
    
    const categoryProducts = productsDB.filter(p => p.category === categoryId);
    
    // Masquer les catégories
    const menuCategories = document.querySelector('.menu-categories');
    if (menuCategories) menuCategories.style.display = 'none';
    
    // Afficher les produits
    const productsSection = document.querySelector('.products-section');
    const categoryTitle = document.getElementById('category-title');
    const productsGrid = document.getElementById('productsGrid');
    
    if (productsSection) productsSection.style.display = 'block';
    if (categoryTitle) categoryTitle.textContent = category.name;
    
    if (productsGrid) {
        productsGrid.innerHTML = '';
        
        if (categoryProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="products-loading" style="grid-column: 1 / -1;">
                    <i class="fas fa-utensils"></i>
                    <h3>Aucun produit dans cette catégorie</h3>
                    <p>Ajoutez des produits via le panneau administrateur</p>
                </div>
            `;
            return;
        }
        
        categoryProducts.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-card';
            productElement.dataset.productId = product.id;
            
            const productImage = product.image || DEFAULT_PRODUCT_IMAGE;
            
            productElement.innerHTML = `
                <div class="product-image" style="background-image: url('${productImage}');">
                    ${product.tags && product.tags[0] ? `<div class="product-badge">${product.tags[0]}</div>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-header">
                        <h3>${product.name}</h3>
                        <span class="product-price">${product.price}</span>
                    </div>
                    ${product.ingredients && product.ingredients.length > 0 ? `
                        <div class="product-tags">
                            ${product.ingredients.map(ingredient => `<span class="product-tag">${ingredient}</span>`).slice(0, 3).join('')}
                            ${product.ingredients.length > 3 ? `<span class="product-tag">+${product.ingredients.length - 3} plus</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
            
            productElement.addEventListener('click', function() {
                showProductDetails(product.id);
            });
            
            productsGrid.appendChild(productElement);
        });
    }
    
    // Faire défiler vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== DÉTAILS PRODUIT ==========
function showProductDetails(productId) {
    const product = productsDB.find(p => p.id === productId);
    if (!product) return;
    
    const category = categoriesDB.find(c => c.id === product.category);
    
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('productModalBody');
    
    if (!modal || !modalBody) return;
    
    const productImage = product.image || DEFAULT_PRODUCT_IMAGE;
    
    modalBody.innerHTML = `
        <div class="modal-image" style="background-image: url('${productImage}');"></div>
        <div class="modal-info">
            <div class="modal-header">
                <h2>${product.name}</h2>
                <div class="modal-price">${product.price}</div>
                ${category ? `<div class="modal-category">${category.name}</div>` : ''}
            </div>
            
            ${product.ingredients && product.ingredients.length > 0 ? `
                <div class="modal-ingredients">
                    <h3><i class="fas fa-clipboard-list"></i> Ingrédients</h3>
                    <div class="ingredients-list">
                        ${product.ingredients.map(ingredient => 
                            `<span class="ingredient"><i class="fas fa-check"></i> ${ingredient.trim()}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${product.tags && product.tags.length > 0 ? `
                <div class="modal-tags">
                    ${product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Ajouter l'événement de fermeture
    const closeBtn = modal.querySelector('.product-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ========== NAVIGATION ==========
function initMenuSystem() {
    // Menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Fermer le menu en cliquant sur un lien
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (menuToggle.querySelector('i')) {
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                }
            });
        });
    }
    
    // Bouton retour aux catégories
    const backBtn = document.querySelector('.back-to-categories');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            const menuCategories = document.querySelector('.menu-categories');
            const productsSection = document.querySelector('.products-section');
            
            if (menuCategories) menuCategories.style.display = 'block';
            if (productsSection) productsSection.style.display = 'none';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Fermer modal produit en cliquant en dehors
    window.addEventListener('click', function(event) {
        const productModal = document.getElementById('productModal');
        if (event.target === productModal) {
            closeProductModal();
        }
    });
    
    // Indicateur de défilement
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
}

// ========== SYSTÈME ADMIN ==========
function initAdminSystem() {
    // Bouton admin dans la navigation
    const adminNavBtn = document.getElementById('adminNavBtn');
    if (adminNavBtn) {
        adminNavBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openAdminModal();
        });
    }
    
    // Fermeture modal admin
    const adminClose = document.querySelector('.admin-close');
    if (adminClose) {
        adminClose.addEventListener('click', closeAdminModal);
    }
    
    // Fermer en cliquant en dehors
    window.addEventListener('click', function(event) {
        const adminModal = document.getElementById('adminModal');
        if (event.target === adminModal) {
            closeAdminModal();
        }
    });
    
    // Code admin
    const adminSubmit = document.getElementById('adminSubmit');
    if (adminSubmit) {
        adminSubmit.addEventListener('click', verifyAdminCode);
    }
    
    const adminCodeInput = document.getElementById('adminCode');
    if (adminCodeInput) {
        adminCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') verifyAdminCode();
        });
    }
    
    // ========== GESTION CATÉGORIES ==========
    // Ajouter catégorie
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addNewCategory);
    }
    
    // Modifier catégorie
    const editCategorySelect = document.getElementById('editCategorySelect');
    if (editCategorySelect) {
        editCategorySelect.addEventListener('change', loadCategoryForEdit);
    }
    
    const updateCategoryBtn = document.getElementById('updateCategoryBtn');
    if (updateCategoryBtn) {
        updateCategoryBtn.addEventListener('click', updateCategory);
    }
    
    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
    if (deleteCategoryBtn) {
        deleteCategoryBtn.addEventListener('click', deleteCategory);
    }
    
    // ========== GESTION PRODUITS ==========
    // Ajouter produit
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addNewProduct);
    }
    
    // Modifier produit
    const editProductSelect = document.getElementById('editProductSelect');
    if (editProductSelect) {
        editProductSelect.addEventListener('change', loadProductForEdit);
    }
    
    const updateProductBtn = document.getElementById('updateProductBtn');
    if (updateProductBtn) {
        updateProductBtn.addEventListener('click', updateProduct);
    }
    
    // Supprimer produit
    const deleteProductBtn = document.getElementById('deleteProductBtn');
    if (deleteProductBtn) {
        deleteProductBtn.addEventListener('click', deleteProduct);
    }
}

function openAdminModal() {
    const adminModal = document.getElementById('adminModal');
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    const adminCodeInput = document.getElementById('adminCode');
    
    if (adminModal) {
        adminModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Réinitialiser les formulaires
        resetAdminForms();
        
        if (adminCodeInput) adminCodeInput.value = '';
        if (adminLogin) adminLogin.style.display = 'block';
        if (adminPanel) adminPanel.style.display = 'none';
        
        isAdmin = false;
        updateAdminUI();
        
        setTimeout(() => {
            if (adminCodeInput) adminCodeInput.focus();
        }, 300);
    }
}

function closeAdminModal() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Réinitialiser les formulaires
        resetAdminForms();
    }
}

function resetAdminForms() {
    // Réinitialiser les champs
    const fieldsToReset = [
        'newCategoryName', 'newCategoryColor',
        'newProductCategorySelect', 'newProductName', 'newProductPrice',
        'newProductIngredients', // Description supprimée
        'editCategoryName', 'editCategoryColor',
        'editProductName', 'editProductPrice', 
        'editProductIngredients', // Description supprimée
        'editProductCategory',
        'adminCode'
    ];
    
    fieldsToReset.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'select-one') {
                element.value = '';
            } else {
                element.value = element.type === 'color' ? '#6B4423' : '';
            }
        }
    });
    
    // Réinitialiser les photos
    tempImages = {
        newCategory: null,
        newProduct: null,
        editCategory: null,
        editProduct: null
    };
    
    // Réinitialiser les prévisualisations
    const previews = [
        'newCategoryPreview',
        'newProductPreview',
        'editCategoryPreview',
        'editProductPreview'
    ];
    
    previews.forEach(id => {
        const preview = document.getElementById(id);
        resetPhotoPreview(preview);
    });
    
    // Réinitialiser les boutons
    const updateCategoryBtn = document.getElementById('updateCategoryBtn');
    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
    const updateProductBtn = document.getElementById('updateProductBtn');
    const deleteProductBtn = document.getElementById('deleteProductBtn');
    
    if (updateCategoryBtn) updateCategoryBtn.disabled = true;
    if (deleteCategoryBtn) deleteCategoryBtn.disabled = true;
    if (updateProductBtn) updateProductBtn.disabled = true;
    if (deleteProductBtn) deleteProductBtn.disabled = true;
}

function verifyAdminCode() {
    const adminCodeInput = document.getElementById('adminCode');
    const adminSubmit = document.getElementById('adminSubmit');
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    
    if (!adminCodeInput) return;
    
    const enteredCode = adminCodeInput.value;
    
    if (enteredCode === ADMIN_CODE) {
        isAdmin = true;
        
        if (adminLogin) adminLogin.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        
        updateAdminUI();
        loadCategoriesForSelect();
        loadCategoriesForEdit();
        loadCategoriesForProductEdit();
        loadProductsForEdit();
        
        if (adminSubmit) {
            adminSubmit.innerHTML = '<i class="fas fa-check"></i> Accès Autorisé';
            adminSubmit.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            
            setTimeout(() => {
                adminSubmit.innerHTML = '<i class="fas fa-unlock"></i> Valider';
                adminSubmit.style.background = '';
            }, 2000);
        }
        
        showNotification('Connexion administrateur réussie ✅', 'success');
        
    } else {
        if (adminCodeInput) {
            adminCodeInput.style.borderColor = '#e74c3c';
            adminCodeInput.style.animation = 'shake 0.5s';
        }
        
        if (adminSubmit) {
            adminSubmit.innerHTML = '<i class="fas fa-times"></i> Code Incorrect';
            adminSubmit.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        }
        
        setTimeout(() => {
            if (adminCodeInput) {
                adminCodeInput.style.borderColor = '';
                adminCodeInput.style.animation = '';
                adminCodeInput.value = '';
                adminCodeInput.focus();
            }
            if (adminSubmit) {
                adminSubmit.innerHTML = '<i class="fas fa-unlock"></i> Valider';
                adminSubmit.style.background = '';
            }
        }, 1500);
        
        showNotification('Code administrateur incorrect ❌', 'error');
    }
}

function updateAdminUI() {
    const adminNavBtn = document.getElementById('adminNavBtn');
    if (adminNavBtn) {
        if (isAdmin) {
            adminNavBtn.classList.add('admin-active');
            adminNavBtn.title = 'Admin connecté';
            adminNavBtn.innerHTML = '<i class="fas fa-user-shield"></i><span class="admin-text">Admin</span>';
        } else {
            adminNavBtn.classList.remove('admin-active');
            adminNavBtn.title = 'Administration';
            adminNavBtn.innerHTML = '<i class="fas fa-cog"></i><span class="admin-text">Admin</span>';
        }
    }
}

// ========== GESTION CATÉGORIES ==========
function loadCategoriesForSelect() {
    const categorySelect = document.getElementById('newProductCategorySelect');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
    
    categoriesDB.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

function loadCategoriesForEdit() {
    const editCategorySelect = document.getElementById('editCategorySelect');
    if (!editCategorySelect) return;
    
    editCategorySelect.innerHTML = '<option value="">Sélectionner une catégorie à modifier</option>';
    
    categoriesDB.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        editCategorySelect.appendChild(option);
    });
}

function addNewCategory() {
    const newCategoryName = document.getElementById('newCategoryName');
    const newCategoryColor = document.getElementById('newCategoryColor');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    
    if (!newCategoryName) return;
    
    const name = newCategoryName.value.trim();
    const color = newCategoryColor ? newCategoryColor.value : '#6B4423';
    
    if (!name) {
        showNotification('Veuillez remplir le nom de la catégorie ❌', 'error');
        return;
    }
    
    // Vérifier si la catégorie existe déjà
    if (categoriesDB.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Une catégorie avec ce nom existe déjà ❌', 'error');
        return;
    }
    
    // Déterminer le type de catégorie basé sur le nom
    let type = 'default';
    const nameLower = name.toLowerCase();
    if (nameLower.includes('chocolat')) type = 'chocolat';
    else if (nameLower.includes('pistache')) type = 'pistache';
    else if (nameLower.includes('fusion')) type = 'fusion';
    else if (nameLower.includes('boisson')) type = 'boissons';
    else if (nameLower.includes('café') || nameLower.includes('cafe')) type = 'boissons';
    else if (nameLower.includes('dessert') || nameLower.includes('gâteau')) type = 'chocolat';
    
    // Générer un ID unique
    const newId = categoriesDB.length > 0 ? Math.max(...categoriesDB.map(c => c.id)) + 1 : 1;
    
    // Utiliser l'image uploadée ou l'image par défaut
    const image = tempImages.newCategory || DEFAULT_CATEGORY_IMAGE;
    
    const newCategory = {
        id: newId,
        name: name,
        color: color,
        image: image,
        type: type,
        createdAt: new Date().toISOString()
    };
    
    categoriesDB.push(newCategory);
    saveMenuData();
    displayCategories();
    loadCategoriesForSelect();
    loadCategoriesForEdit();
    loadCategoriesForProductEdit();
    
    // Réinitialiser
    newCategoryName.value = '';
    if (newCategoryColor) newCategoryColor.value = '#6B4423';
    tempImages.newCategory = null;
    resetPhotoPreview(document.getElementById('newCategoryPreview'));
    
    if (addCategoryBtn) {
        addCategoryBtn.innerHTML = '<i class="fas fa-check"></i> Catégorie Ajoutée !';
        addCategoryBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        
        setTimeout(() => {
            addCategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter Catégorie';
            addCategoryBtn.style.background = '';
        }, 2000);
    }
    
    showNotification(`Catégorie "${name}" ajoutée avec succès ✅`, 'success');
}

function loadCategoryForEdit() {
    const editCategorySelect = document.getElementById('editCategorySelect');
    const editCategoryName = document.getElementById('editCategoryName');
    const editCategoryColor = document.getElementById('editCategoryColor');
    const editCategoryPreview = document.getElementById('editCategoryPreview');
    const updateCategoryBtn = document.getElementById('updateCategoryBtn');
    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
    
    if (!editCategorySelect || !editCategoryName) return;
    
    const categoryId = parseInt(editCategorySelect.value);
    
    if (categoryId) {
        const category = categoriesDB.find(c => c.id === categoryId);
        
        if (category) {
            editCategoryName.value = category.name;
            if (editCategoryColor) editCategoryColor.value = category.color || '#6B4423';
            
            // Afficher l'image existante
            if (editCategoryPreview) {
                editCategoryPreview.innerHTML = `
                    <img src="${category.image}" alt="Prévisualisation">
                    <div class="photo-upload-info">
                        <i class="fas fa-image"></i> Image actuelle
                    </div>
                `;
                editCategoryPreview.classList.add('active');
            }
            
            if (updateCategoryBtn) updateCategoryBtn.disabled = false;
            if (deleteCategoryBtn) deleteCategoryBtn.disabled = false;
        }
    } else {
        editCategoryName.value = '';
        if (editCategoryColor) editCategoryColor.value = '#6B4423';
        resetPhotoPreview(editCategoryPreview);
        
        if (updateCategoryBtn) updateCategoryBtn.disabled = true;
        if (deleteCategoryBtn) deleteCategoryBtn.disabled = true;
    }
}

function updateCategory() {
    const editCategorySelect = document.getElementById('editCategorySelect');
    const editCategoryName = document.getElementById('editCategoryName');
    const editCategoryColor = document.getElementById('editCategoryColor');
    const updateCategoryBtn = document.getElementById('updateCategoryBtn');
    
    if (!editCategorySelect || !editCategoryName) return;
    
    const categoryId = parseInt(editCategorySelect.value);
    const newName = editCategoryName.value.trim();
    const newColor = editCategoryColor ? editCategoryColor.value : '#6B4423';
    
    if (!categoryId || !newName) {
        showNotification('Veuillez sélectionner une catégorie et remplir le nom ❌', 'error');
        return;
    }
    
    const categoryIndex = categoriesDB.findIndex(c => c.id === categoryId);
    
    if (categoryIndex !== -1) {
        // Déterminer le type
        let type = categoriesDB[categoryIndex].type || 'default';
        const nameLower = newName.toLowerCase();
        if (nameLower.includes('chocolat')) type = 'chocolat';
        else if (nameLower.includes('pistache')) type = 'pistache';
        else if (nameLower.includes('fusion')) type = 'fusion';
        else if (nameLower.includes('boisson')) type = 'boissons';
        else if (nameLower.includes('café') || nameLower.includes('cafe')) type = 'boissons';
        else if (nameLower.includes('dessert') || nameLower.includes('gâteau')) type = 'chocolat';
        
        // Utiliser la nouvelle image ou garder l'ancienne
        const newImage = tempImages.editCategory || categoriesDB[categoryIndex].image;
        
        categoriesDB[categoryIndex] = {
            ...categoriesDB[categoryIndex],
            name: newName,
            color: newColor,
            image: newImage,
            type: type,
            updatedAt: new Date().toISOString()
        };
        
        saveMenuData();
        displayCategories();
        loadCategoriesForSelect();
        loadCategoriesForEdit();
        loadCategoriesForProductEdit();
        
        // Réinitialiser
        tempImages.editCategory = null;
        
        if (updateCategoryBtn) {
            updateCategoryBtn.innerHTML = '<i class="fas fa-check"></i> Catégorie Modifiée !';
            updateCategoryBtn.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
            
            setTimeout(() => {
                updateCategoryBtn.innerHTML = '<i class="fas fa-save"></i> Mettre à Jour';
                updateCategoryBtn.style.background = '';
            }, 2000);
        }
        
        showNotification(`Catégorie "${newName}" mise à jour ✅`, 'success');
    }
}

function deleteCategory() {
    const editCategorySelect = document.getElementById('editCategorySelect');
    
    if (!editCategorySelect) return;
    
    const categoryId = parseInt(editCategorySelect.value);
    
    if (!categoryId) {
        showNotification('Veuillez sélectionner une catégorie ❌', 'error');
        return;
    }
    
    const category = categoriesDB.find(c => c.id === categoryId);
    if (!category) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\n⚠️ ATTENTION : Tous les produits (${productsDB.filter(p => p.category === categoryId).length}) de cette catégorie seront également supprimés.\n\nCette action est irréversible !`)) {
        return;
    }
    
    const categoryIndex = categoriesDB.findIndex(c => c.id === categoryId);
    
    if (categoryIndex !== -1) {
        const categoryName = categoriesDB[categoryIndex].name;
        const productsCount = productsDB.filter(p => p.category === categoryId).length;
        
        // Supprimer tous les produits de cette catégorie
        productsDB = productsDB.filter(p => p.category !== categoryId);
        
        // Supprimer la catégorie
        categoriesDB.splice(categoryIndex, 1);
        
        saveMenuData();
        displayCategories();
        loadCategoriesForSelect();
        loadCategoriesForEdit();
        loadCategoriesForProductEdit();
        loadProductsForEdit();
        
        // Réinitialiser les champs
        const editCategoryName = document.getElementById('editCategoryName');
        const editCategoryColor = document.getElementById('editCategoryColor');
        const updateCategoryBtn = document.getElementById('updateCategoryBtn');
        const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
        
        if (editCategoryName) editCategoryName.value = '';
        if (editCategoryColor) editCategoryColor.value = '#6B4423';
        if (updateCategoryBtn) updateCategoryBtn.disabled = true;
        if (deleteCategoryBtn) deleteCategoryBtn.disabled = true;
        
        tempImages.editCategory = null;
        resetPhotoPreview(document.getElementById('editCategoryPreview'));
        
        showNotification(`Catégorie "${categoryName}" supprimée (${productsCount} produit(s) supprimé(s)) 🗑️`, 'warning');
    }
}

// ========== GESTION PRODUITS ==========
function getNextProductId() {
    if (productsDB.length === 0) return 1;
    return Math.max(...productsDB.map(p => p.id)) + 1;
}

function addNewProduct() {
    const newProductCategorySelect = document.getElementById('newProductCategorySelect');
    const newProductName = document.getElementById('newProductName');
    const newProductPrice = document.getElementById('newProductPrice');
    const newProductIngredients = document.getElementById('newProductIngredients'); // Changé de Desc à Ingredients
    const addProductBtn = document.getElementById('addProductBtn');
    
    if (!newProductCategorySelect || !newProductName || !newProductPrice || !newProductIngredients) return;
    
    const categoryId = parseInt(newProductCategorySelect.value);
    const name = newProductName.value.trim();
    const price = newProductPrice.value.trim();
    const ingredients = newProductIngredients ? 
        newProductIngredients.value.split(',').map(i => i.trim()).filter(i => i) : [];
    
    if (!categoryId) {
        showNotification('Veuillez sélectionner une catégorie ❌', 'error');
        return;
    }
    
    if (!name) {
        showNotification('Veuillez remplir le nom du produit ❌', 'error');
        return;
    }
    
    if (!price) {
        showNotification('Veuillez remplir le prix du produit ❌', 'error');
        return;
    }
    
    if (ingredients.length === 0) {
        showNotification('Veuillez ajouter au moins un ingrédient ❌', 'error');
        return;
    }
    
    // Vérifier le format du prix
    if (!price.match(/^[0-9]+(\.[0-9]+)?\s*DT$/i) && !price.match(/^[0-9]+(\.[0-9]+)?$/)) {
        showNotification('Format de prix invalide. Exemple: 10.500 DT ou 10.500', 'error');
        return;
    }
    
    // Formater le prix
    const formattedPrice = price.toUpperCase().includes('DT') ? price : price + ' DT';
    
    // Utiliser l'image uploadée ou l'image par défaut
    const image = tempImages.newProduct || DEFAULT_PRODUCT_IMAGE;
    
    const newProduct = {
        id: getNextProductId(),
        name: name,
        price: formattedPrice,
        description: "", // Description supprimée
        category: categoryId,
        ingredients: ingredients,
        tags: [],
        image: image,
        createdAt: new Date().toISOString()
    };
    
    productsDB.push(newProduct);
    saveMenuData();
    displayCategories();
    loadProductsForEdit();
    
    // Réinitialiser
    newProductCategorySelect.value = '';
    newProductName.value = '';
    newProductPrice.value = '';
    if (newProductIngredients) newProductIngredients.value = '';
    
    tempImages.newProduct = null;
    resetPhotoPreview(document.getElementById('newProductPreview'));
    
    if (addProductBtn) {
        addProductBtn.innerHTML = '<i class="fas fa-check"></i> Produit Ajouté !';
        addProductBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        
        setTimeout(() => {
            addProductBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter Produit';
            addProductBtn.style.background = '';
        }, 2000);
    }
    
    showNotification(`Produit "${name}" ajouté avec succès ✅`, 'success');
}

function loadCategoriesForProductEdit() {
    const editProductCategory = document.getElementById('editProductCategory');
    if (!editProductCategory) return;
    
    editProductCategory.innerHTML = '<option value="">Sélectionner une catégorie</option>';
    
    categoriesDB.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        editProductCategory.appendChild(option);
    });
}

function loadProductsForEdit() {
    const editProductSelect = document.getElementById('editProductSelect');
    if (!editProductSelect) return;
    
    editProductSelect.innerHTML = '<option value="">Sélectionner un produit à modifier</option>';
    
    productsDB.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ${product.price}`;
        editProductSelect.appendChild(option);
    });
}

function loadProductForEdit() {
    const editProductSelect = document.getElementById('editProductSelect');
    const editProductName = document.getElementById('editProductName');
    const editProductPrice = document.getElementById('editProductPrice');
    const editProductIngredients = document.getElementById('editProductIngredients'); // Changé de Desc à Ingredients
    const editProductCategory = document.getElementById('editProductCategory');
    const editProductPreview = document.getElementById('editProductPreview');
    const updateProductBtn = document.getElementById('updateProductBtn');
    const deleteProductBtn = document.getElementById('deleteProductBtn');
    
    if (!editProductSelect || !editProductName) return;
    
    const productId = parseInt(editProductSelect.value);
    
    if (productId) {
        const product = productsDB.find(p => p.id === productId);
        
        if (product) {
            editProductName.value = product.name;
            editProductPrice.value = product.price;
            if (editProductIngredients) editProductIngredients.value = product.ingredients ? product.ingredients.join(', ') : '';
            if (editProductCategory) editProductCategory.value = product.category;
            
            // Afficher l'image existante
            if (editProductPreview) {
                editProductPreview.innerHTML = `
                    <img src="${product.image}" alt="Prévisualisation">
                    <div class="photo-upload-info">
                        <i class="fas fa-image"></i> Image actuelle
                    </div>
                `;
                editProductPreview.classList.add('active');
            }
            
            if (updateProductBtn) updateProductBtn.disabled = false;
            if (deleteProductBtn) deleteProductBtn.disabled = false;
        }
    } else {
        editProductName.value = '';
        editProductPrice.value = '';
        if (editProductIngredients) editProductIngredients.value = '';
        if (editProductCategory) editProductCategory.value = '';
        resetPhotoPreview(editProductPreview);
        
        if (updateProductBtn) updateProductBtn.disabled = true;
        if (deleteProductBtn) deleteProductBtn.disabled = true;
    }
}

function updateProduct() {
    const editProductSelect = document.getElementById('editProductSelect');
    const editProductName = document.getElementById('editProductName');
    const editProductPrice = document.getElementById('editProductPrice');
    const editProductIngredients = document.getElementById('editProductIngredients'); // Changé de Desc à Ingredients
    const editProductCategory = document.getElementById('editProductCategory');
    const updateProductBtn = document.getElementById('updateProductBtn');
    
    if (!editProductSelect || !editProductName) return;
    
    const productId = parseInt(editProductSelect.value);
    const newName = editProductName.value.trim();
    const newPrice = editProductPrice.value.trim();
    const newIngredients = editProductIngredients ? 
        editProductIngredients.value.split(',').map(i => i.trim()).filter(i => i) : [];
    const newCategoryId = editProductCategory ? parseInt(editProductCategory.value) : null;
    
    if (!productId) {
        showNotification('Veuillez sélectionner un produit ❌', 'error');
        return;
    }
    
    if (!newName) {
        showNotification('Veuillez remplir le nom du produit ❌', 'error');
        return;
    }
    
    if (!newPrice) {
        showNotification('Veuillez remplir le prix du produit ❌', 'error');
        return;
    }
    
    if (newIngredients.length === 0) {
        showNotification('Veuillez ajouter au moins un ingrédient ❌', 'error');
        return;
    }
    
    if (!newCategoryId) {
        showNotification('Veuillez sélectionner une catégorie ❌', 'error');
        return;
    }
    
    // Vérifier le format du prix
    if (!newPrice.match(/^[0-9]+(\.[0-9]+)?\s*DT$/i) && !newPrice.match(/^[0-9]+(\.[0-9]+)?$/)) {
        showNotification('Format de prix invalide. Exemple: 10.500 DT ou 10.500', 'error');
        return;
    }
    
    // Formater le prix
    const formattedPrice = newPrice.toUpperCase().includes('DT') ? newPrice : newPrice + ' DT';
    
    const productIndex = productsDB.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        // Utiliser la nouvelle image ou garder l'ancienne
        const newImage = tempImages.editProduct || productsDB[productIndex].image;
        
        const updatedProduct = {
            ...productsDB[productIndex],
            name: newName,
            price: formattedPrice,
            description: "", // Description supprimée
            ingredients: newIngredients,
            image: newImage,
            category: newCategoryId,
            updatedAt: new Date().toISOString()
        };
        
        productsDB[productIndex] = updatedProduct;
        saveMenuData();
        displayCategories();
        
        // Rafraîchir si on est dans la vue des produits
        const productsSection = document.querySelector('.products-section');
        if (productsSection && productsSection.style.display !== 'none' && newCategoryId) {
            showCategoryProducts(newCategoryId);
        }
        
        loadProductsForEdit();
        
        // Réinitialiser
        tempImages.editProduct = null;
        
        if (updateProductBtn) {
            updateProductBtn.innerHTML = '<i class="fas fa-check"></i> Produit Modifié !';
            updateProductBtn.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
            
            setTimeout(() => {
                updateProductBtn.innerHTML = '<i class="fas fa-save"></i> Mettre à Jour';
                updateProductBtn.style.background = '';
            }, 2000);
        }
        
        showNotification(`Produit "${newName}" mis à jour ✅`, 'success');
    }
}

function deleteProduct() {
    const editProductSelect = document.getElementById('editProductSelect');
    
    if (!editProductSelect) return;
    
    const productId = parseInt(editProductSelect.value);
    
    if (!productId) {
        showNotification('Veuillez sélectionner un produit ❌', 'error');
        return;
    }
    
    const product = productsDB.find(p => p.id === productId);
    if (!product) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?\n\nCette action est irréversible !`)) {
        return;
    }
    
    const productIndex = productsDB.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        const productName = productsDB[productIndex].name;
        const productCategory = productsDB[productIndex].category;
        
        productsDB.splice(productIndex, 1);
        saveMenuData();
        displayCategories();
        
        // Rafraîchir si on est dans la vue des produits
        const productsSection = document.querySelector('.products-section');
        if (productsSection && productsSection.style.display !== 'none') {
            showCategoryProducts(productCategory);
        }
        
        loadProductsForEdit();
        
        // Réinitialiser
        tempImages.editProduct = null;
        
        const editProductName = document.getElementById('editProductName');
        const editProductPrice = document.getElementById('editProductPrice');
        const editProductIngredients = document.getElementById('editProductIngredients');
        const editProductCategory = document.getElementById('editProductCategory');
        const updateProductBtn = document.getElementById('updateProductBtn');
        const deleteProductBtn = document.getElementById('deleteProductBtn');
        
        if (editProductName) editProductName.value = '';
        if (editProductPrice) editProductPrice.value = '';
        if (editProductIngredients) editProductIngredients.value = '';
        if (editProductCategory) editProductCategory.value = '';
        if (updateProductBtn) updateProductBtn.disabled = true;
        if (deleteProductBtn) deleteProductBtn.disabled = true;
        
        resetPhotoPreview(document.getElementById('editProductPreview'));
        
        showNotification(`Produit "${productName}" supprimé 🗑️`, 'warning');
    }
}

// ========== UTILITAIRES ==========
function initAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10002;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        }
        
        .notification.success {
            border-left: 4px solid #27ae60;
        }
        
        .notification.error {
            border-left: 4px solid #e74c3c;
        }
        
        .notification.warning {
            border-left: 4px solid #f39c12;
        }
        
        .notification.info {
            border-left: 4px solid #3498db;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

console.log('✅ Script.js chargé avec succès !');