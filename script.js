// DOM Elements
const addRecipeBtn = document.querySelector('#addRecipeBtn');
const recipeForm = document.querySelector('#recipeForm');
const recipeFormElement = document.querySelector('#recipeFormElement');
const cancelBtn = document.querySelector('#cancelBtn');
const recipesContainer = document.querySelector('#recipesContainer');
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const totalCaloriesElement = document.querySelector('#totalCalories');

// State
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
let isEditing = false;
let currentRecipeId = null;

// Initialize the app
function init() {
    // Add sample recipes if none exist
    if (recipes.length === 0) {
        addSampleRecipes();
    }
    
    renderRecipes();
    updateTotalCalories();
    
    // Event Listeners
    addRecipeBtn.addEventListener('click', openAddRecipeForm);
    recipeFormElement.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', closeRecipeForm);
    searchBtn.addEventListener('click', filterRecipes);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterRecipes();
    });
}

// Add sample recipes
function addSampleRecipes() {
    const sampleRecipes = [
        {
            id: generateId(),
            name: 'Pasta Carbonara',
            ingredients: ['spaghetti', 'eggs', 'pancetta', 'parmesan', 'black pepper'],
            calories: 650,
            isFavorite: false
        },
        {
            id: generateId(),
            name: 'Greek Salad',
            ingredients: ['cucumber', 'tomato', 'red onion', 'feta cheese', 'olives', 'olive oil'],
            calories: 320,
            isFavorite: true
        },
        {
            id: generateId(),
            name: 'Chicken Curry',
            ingredients: ['chicken breast', 'coconut milk', 'curry paste', 'onion', 'garlic', 'ginger'],
            calories: 480,
            isFavorite: false
        },
        {
            id: generateId(),
            name: 'Avocado Toast',
            ingredients: ['sourdough bread', 'avocado', 'cherry tomatoes', 'red pepper flakes', 'lemon juice'],
            calories: 280,
            isFavorite: true
        },
        {
            id: generateId(),
            name: 'Chocolate Chip Cookies',
            ingredients: ['flour', 'butter', 'sugar', 'chocolate chips', 'eggs', 'vanilla extract'],
            calories: 150,
            isFavorite: false
        }
    ];
    
    recipes = sampleRecipes;
    saveRecipes();
}

// Render recipes to the DOM
function renderRecipes(recipesToRender = recipes) {
    recipesContainer.innerHTML = '';
    
    if (recipesToRender.length === 0) {
        recipesContainer.innerHTML = '<p class="no-recipes">No recipes found. Add a new recipe to get started!</p>';
        return;
    }
    
    recipesToRender.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipesContainer.appendChild(recipeCard);
    });}

// Create a recipe card element
function createRecipeCard(recipe) {
    const { id, name, ingredients, calories, isFavorite } = recipe;
    
    const card = document.createElement('div');
    card.className = `recipe-card ${isFavorite ? 'favorite' : ''}`;
    card.dataset.id = id;
    
    card.innerHTML = `
        <div class="recipe-header">
            <h3 class="recipe-title">${name}</h3>
            <span class="recipe-calories">${calories} cal</span>
        </div>
        <div class="recipe-ingredients">
            <h4>Ingredients:</h4>
            <ul class="ingredients-list">
                ${ingredients.map(ing => `<li>${ing.trim()}</li>`).join('')}
            </ul>
        </div>
        <div class="recipe-actions">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${id}">
                <i class="fas fa-star"></i>
            </button>
            <div>
                <button class="edit-btn" data-id="${id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" data-id="${id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to the buttons
    const favoriteBtn = card.querySelector('.favorite-btn');
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    
    favoriteBtn.addEventListener('click', () => toggleFavorite(id));
    editBtn.addEventListener('click', () => editRecipe(id));
    deleteBtn.addEventListener('click', () => deleteRecipe(id));
    
    return card;
}

// Open the add recipe form
function openAddRecipeForm() {
    isEditing = false;
    currentRecipeId = null;
    document.querySelector('#formTitle').textContent = 'Add New Recipe';
    recipeFormElement.reset();
    recipeForm.style.display = 'flex';
}

// Close the recipe form
function closeRecipeForm() {
    recipeForm.style.display = 'none';
    recipeFormElement.reset();
    document.querySelector('#recipeId').value = '';
    isEditing = false;
    currentRecipeId = null;
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const name = document.querySelector('#recipeName').value.trim();
    const ingredients = document.querySelector('#ingredients').value
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing !== '');
    const calories = parseInt(document.querySelector('#calories').value);
    
    if (isEditing && currentRecipeId) {
        // Update existing recipe
        const index = recipes.findIndex(recipe => recipe.id === currentRecipeId);
        if (index !== -1) {
            recipes[index] = {
                ...recipes[index],
                name,
                ingredients,
                calories
            };
        }
    } else {
        // Add new recipe
        const newRecipe = {
            id: generateId(),
            name,
            ingredients,
            calories,
            isFavorite: false
        };
        recipes.unshift(newRecipe);
    }
    
    saveRecipes();
    renderRecipes();
    closeRecipeForm();
    updateTotalCalories();
}

// Toggle favorite status of a recipe
function toggleFavorite(id) {
    const index = recipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
        recipes[index].isFavorite = !recipes[index].isFavorite;
        saveRecipes();
        renderRecipes();
        updateTotalCalories();
    }
}

// Edit a recipe
function editRecipe(id) {
    const recipe = recipes.find(recipe => recipe.id === id);
    if (recipe) {
        isEditing = true;
        currentRecipeId = id;
        
        document.querySelector('#formTitle').textContent = 'Edit Recipe';
        document.querySelector('#recipeName').value = recipe.name;
        document.querySelector('#ingredients').value = recipe.ingredients.join(', ');
        document.querySelector('#calories').value = recipe.calories;
        
        recipeForm.style.display = 'flex';
    }
}

// Delete a recipe
function deleteRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        recipes = recipes.filter(recipe => recipe.id !== id);
        saveRecipes();
        renderRecipes();
        updateTotalCalories();
    }
}

// Filter recipes based on search input
function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderRecipes();
        return;
    }
    
    const filteredRecipes = recipes.filter(recipe => {
        const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
        const ingredientMatch = recipe.ingredients.some(ing => 
            ing.toLowerCase().includes(searchTerm)
        );
        return nameMatch || ingredientMatch;
    });
    
    renderRecipes(filteredRecipes);
}

// Update the total calories of favorite recipes
function updateTotalCalories() {
    const total = recipes
        .filter(recipe => recipe.isFavorite)
        .reduce((sum, recipe) => sum + recipe.calories, 0);
    
    totalCaloriesElement.textContent = total;
}

// Save recipes to localStorage
function saveRecipes() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);