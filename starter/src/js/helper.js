//contains all helper functions.

//for state.recipe we are importing this

//used for MODEL.JS
import * as model from '../js/model.js';
import {TIMEOUT_SECONDS} from '../js/config.js'

//used for VIEW.JS
import importedIcons from '../img/icons.svg';
// import {fraction} from 'fractional';

//<-------------------------------------helper functions for MODEL.JS---------------------------------------->
const timeout = function (seconds) {
  //Promise takes one call back function
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(
        new Error(`Request took too long! Timeout after ${seconds} second`)
      ); //manual and meaningful error message
    }, seconds * 1000);
  });
};

//only url is getJSON,both url and data is for sendJSON
export const AJAX = async function(url,uploadData = undefined)
{
  try
  {
    const fetchPro = (uploadData)?fetch(url,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(uploadData),
    }):fetch(url);

    const res = await Promise.race([fetchPro,timeout(TIMEOUT_SECONDS)]);
    const data = await res.json();

    if(!res.ok) throw new Error(`${data.message} ${res.status}`);
    return data;
  }
  catch(error)
  {
    throw error;
  }
}

/*
export const sendJSON = async function(url,uploadData)
{
  try
  {
    const fetchPro = fetch(url,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(uploadData),
    });
  
    const res = await Promise.race([fetchPro,timeout(TIMEOUT_SECONDS)]);
    const data = await res.json();//doing this only to print error. 

    if(!res.ok) throw new Error(`${data.message},${res.status}`);
    return data;
  }
  catch(error)
  {
    throw error;
  }
}


export const getJSON = async function(url)
{
  try
  {
    const response = await Promise.race([fetch(url),timeout(TIMEOUT_SECONDS)]); //Jonas's recipes api,dynamically change recipe id to load the needed recipe.

    //below if-else is to handle fetch() error(which is not considered as error by JS)
    //no need to handle timeout(bcoz it is considered as an error)

    //before timeout if fetch is completed then this is returned.
    const jsonFormat = await response.json(); //convert it into json format.

    if(response.ok)
    return jsonFormat;
    else//bcoz bad request is not considered as error
    {
      throw new Error(`${jsonFormat.message} (${response.status})`);
    }
  }
  catch(error)
  {
    throw error; //api is providing error message
    //return error(new error) to model.js file
  }
}
*/

export const renameRecipeDetails = function(recipe)
{
  model.state.recipe = createRecipeObject(recipe);

  //includes() uses strict equality so comparing two objects would return false(even though they are same)
  if(model.state.bookmarks.some((bookRecipe)=>{return bookRecipe.id === recipe.id}))//while displaying recipe in RHS,if its present in array,then fill bookmark
  {
    model.state.recipe.isBookmarked = true;
  }
  else//else normal icon.
  {
    model.state.recipe.isBookmarked = false;
  }
}

export const createRecipeObject = function(recipe)
{
  //this object will be added to the state object.
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceURL: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    isBookmarked:false,//default
    ...(recipe.key && {key:recipe.key}),//if key exists,then inner object is created ,then it is made flat using ...spread operator
  }; //changing property names as per our convenience.
}


//<------------------------------END OF MODEL.JS FUNCTIONS--------------------------------------------------->



//<-----------------------------------helper functions for recipeView.JS------------------------------>

//1.4.1-->HTML for image and title of recipe
export const imageAndTitle = function(recipeDetails) 
{
  const imageAndTitleHTML = `<figure class="recipe__fig">
          <img src="${recipeDetails.image}" alt="${recipeDetails.title}" class="recipe__img" />
          <h1 class="recipe__title">
            <span>${recipeDetails.title}</span>
          </h1>
        </figure>`;

  return imageAndTitleHTML;
}

  //1.4.2-->HTML for cookingTime
  export const cookingTime = function(recipeDetails) 
{
  const cookingTimeHTML = `
  <div class="recipe__info">
    <svg class="recipe__info-icon">
      <use href="${importedIcons}#icon-clock"></use>
    </svg>
    <span class="recipe__info-data recipe__info-data--minutes">${recipeDetails.cookingTime}</span>
    <span class="recipe__info-text">minutes</span>
  </div>`;

  return cookingTimeHTML;
}

//1.4.3-->HTML for servings(contains increasing and decreasing buttons as well)
export const servings = function(recipeDetails)
{
  const servingsHTML = `
    <div class="recipe__info">
      <svg class="recipe__info-icon">
        <use href="${importedIcons}#icon-users"></use>
      </svg>
      <span class="recipe__info-data recipe__info-data--people">${recipeDetails.servings}</span>
      <span class="recipe__info-text">servings</span>

      <div class="recipe__info-buttons">
        <button data-servings=${recipeDetails.servings-1} class="btn--tiny btn--decrease-servings">
          <svg>
            <use href="${importedIcons}#icon-minus-circle"></use>
          </svg>
        </button>
        <button data-servings=${recipeDetails.servings+1} class="btn--tiny btn--increase-servings">
          <svg>
            <use href="${importedIcons}#icon-plus-circle"></use>
          </svg>
        </button>
      </div>
    </div>`;

  return servingsHTML;
}

//1.4.4-->HTML to indicate recipe is userGenerated or not
export const userGenerated = function(recipeDetails) {
  const userGenIndicatorHTML = `<div class="recipe__user-generated ${recipeDetails.key?'':'hidden'}">
  <svg>
    <use href="${importedIcons}#icon-user"></use>
  </svg>
  </div>`;

  return userGenIndicatorHTML;
}

//1.4.5-->HTML for BookMark
export const bookMark = function(recipeDetails) {
  const bookMarkHTML = `<button class="btn--round btn--bookmark">
              <svg class="">
                <use href="${importedIcons}#icon-bookmark${(recipeDetails.isBookmarked)?'-fill':''}"></use>
              </svg>
            </button>`;

  return bookMarkHTML;
}

//1.4.6--->HTML for ingredients
export const recipeIngredients = function(recipeDetails) {
  const ingredientsHTML = `<div class="recipe__ingredients">
  <h2 class="heading--2">Recipe ingredients</h2>
  <ul class="recipe__ingredient-list"> 
  ${this.displayIngredients(recipeDetails.ingredients)}
  </ul>
  </div> `;

  //1.4.6.1-->Loop to display All ingredients

  return ingredientsHTML;
}

//1.4.6.1-->display_ingredients() is a helper function of showRecipe()
export const displayIngredients = function(ingredients) 
{
  //method 1:using forEach
  /*
  let ingredientsHTML = '';
  ingredients.forEach(ingredient => {
    ingredientsHTML += `<li class="recipe__ingredient">
    <svg class="recipe__icon">
    <use href="src/img/icons.svg#icon-check"></use>
    </svg>
    <div class="recipe__quantity">${ingredient.quantity}</div>
    <div class="recipe__description">
    <span class="recipe__unit">${ingredient.unit}</span>
    ${ingredient.description}
    </div>
    </li>`;
  });
    */

  //method 2:instead of forEach try using map and join()
  return ingredients
    .map(ing => 
    {
      return `<li class="recipe__ingredient">
      <svg class="recipe__icon">
      <use href="${importedIcons}#icon-check"></use>
      </svg>
      <div class="recipe__quantity">${ing.quantity?ing.quantity:''}</div>
      <div class="recipe__description">
      <span class="recipe__unit">${ing.unit?ing.unit:''}</span>
      ${ing.description}
      </div>
      </li>`;
    })//call practicalQuantity in above html code snippet
    .join('');
//1.4.6.1.1-->to updates quantity into practical real world quantity
}

//1.4.6.1.1-->to updates quantity into practical real world quantity.
export const practicalQuantity = function(quantity)
{
  if(quantity)
  return new fraction(quantity).toString();
  else
  return '';
}

//1.4.7-->HTML for recipe Directions
export const recipeDirections = function(recipeDetails) {
  const directions = `<div class="recipe__directions">
  <h2 class="heading--2">How to cook it</h2>
  <p class="recipe__directions-text">
    This recipe was carefully designed and tested by <span class="recipe__publisher">${recipeDetails.publisher}</span>. Please check out directions at their website.
  </p>
  <a
    class="btn--small recipe__btn"
    href="${recipeDetails.sourceURL}/"
    target="_blank"
  >
    <span>Directions</span>
    <svg class="search__icon">
      <use href="${importedIcons}#icon-arrow-right"></use>
    </svg>
  </a>
  </div>`;

  return directions;
}


//<---------------END OF recipeVIEW.JS FUNCTIONS------------->


//<--------------------------------------Helper functions for ResultsView.js and bookmarksView.js---------------------------------------------->
export const recipeListHTML = function(recipesArray)
{
  const id = window.location.hash.slice(1);
  return recipesArray?.map((currentRecipe)=>{
      return `
      <li class="preview">
        <a class="preview__link ${(currentRecipe.id===id)?`preview__link--active`:''}" href="#${currentRecipe.id}">
            <figure class="preview__fig">
              <img src="${currentRecipe.image}" alt="${currentRecipe.title}" />
            </figure>
          <div class="preview__data">
            <h4 class="preview__title">${currentRecipe.title}</h4>
            <p class="preview__publisher">${currentRecipe.publisher}</p>
            <div class="preview__user-generated ${currentRecipe.key?'':'hidden'}">
              <svg>
              <use href="${importedIcons}#icon-user"></use>
              </svg>
            </div>
          </div>
        </a>
      </li>`}).join('');
}

//friendly message for bookmark
export const friendlyBmMessage = function()
{
  return `<div class="message">
      <div>
        <svg>
          <use href="${importedIcons}#icon-smile"></use>
        </svg>
      </div>
      <p>
        No bookmarks yet. Find a nice recipe and bookmark it :)
      </p>
      </div>`
}

//<----------------END of resultsView.js FUNCTIONS--------------> 


//<--------------------------------------Helper functions for paginationView.js---------------------------------------------->

export const pageButtonsHTML = function(pageNumber)
{
  const resultsDetails = model.state.searchResults;
  
  //page 1
  if(resultsDetails.currentPageNumber === 1)
  {
    //page 1,and there are other next pages(no prev pages)
    if(resultsDetails.totalPages>1)
    return nextBtnHTML(resultsDetails.currentPageNumber);//curPageNum + 1
    else//page 1,and there are no other pages
    return ``;//no buttons are displayed
  }

  //last page,and there are no next pages(only prev)
  else if(resultsDetails.currentPageNumber === resultsDetails.totalPages)
  return prevBtnHTML(resultsDetails.currentPageNumber);//curPageNum-1

  //someother page page,which has both prev and next pages
  else
  {
    return prevBtnHTML(resultsDetails.currentPageNumber)+nextBtnHTML(resultsDetails.currentPageNumber);//curPageNum-1,curPageNUm+1
  }
}

const prevBtnHTML = function(curPageNum)
{
  return `<button data-goto="${
    curPageNum - 1
  }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${importedIcons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPageNum-1}</span>
          </button>`;
}

const nextBtnHTML = function(curPageNum)
{
  return `<button data-goto="${
    curPageNum + 1
  }" class="btn--inline pagination__btn--next">
            <svg class="search__icon">
              <use href="${importedIcons}#icon-arrow-right"></use>
            </svg>
            <span>Page ${curPageNum+1}</span>
          </button>`;
}



//<---------------------------------HELPER FUNCTIONS FOR ADDRECIPEVIEW.JS--------------------------------------------------------------->
//written in AJAX() 
