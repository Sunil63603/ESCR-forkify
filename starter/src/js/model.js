import {API_KEY, API_URL} from './config.js';
import {RES_PER_PAGE} from './config.js';
import { AJAX} from './helper.js'; 
import { renameRecipeDetails } from './helper.js'; 
import { createRecipeObject } from './helper.js';


//this file is Model of MVC architecture.(storing the state and working with AJAX requests)
export const state = {
  //used this to load and display recipe in RHS
  recipe:{
    isBookmarked:false,
  },//this indicates the recipe,which we are currently working with in RHS.
  
  //used this to store and display recipes in LHS
  searchResults:{
    query:'',//keyword used for this recipe ex:pizza,onion..
    results:[],//contains all search results(all recipes)
    totalResults:0,//total number of recipes for search query,default is 0
    resultsPerPage:RES_PER_PAGE,
    
    currentPageNumber:1,//used for pagination purpose
    currentPageResults:[],//used to display current Page's data
    totalPages:0,//used for pagination logic
  },//contains all recipes of search results
  
  //used this to display bookmarked recipes/and also to indicate user about bookmark
  bookmarks:[],//bookmarked recipes will be pushed into this array
};

//<-------------------CODE RELATED TO LOADING AND DISPLAYING RECIPE IN RHS------------------->
//1.3--->loading recipe(AJAX call actually)
export const loadRecipe = async function(recipeID)//AJAX call or working with API.
{
  try
  {
  //1.3.1-->Loading the recipe based on user search query from third party API.
  await fetchRecipeDetails(recipeID);
  }
  catch(error)
  {
    throw error;
  }
}

//1.3.1-->loading the recipe details from API
export async function fetchRecipeDetails(recipeID) {
  try
  {
    const jsonFormat = await AJAX(`${API_URL}/${recipeID}?key=${API_KEY}`);

    responseSuccessfull(jsonFormat);
  }
  catch(error)
  {
    throw error;
  }
}

//1.3.1.1---> when fetching recipe is successful
export function responseSuccessfull(jsonFormat) {
  //response is successful.
  const {recipe} = jsonFormat.data; //get data from jsonFormat

  renameRecipeDetails(recipe);

  //earlier i used to return this recipe and store it in some variable for displaying recipe details.
  //but now we have stored it inside state.recipe object so no need to return and store(once again).
}


//<------------CODE RELATED TO LOADING AND DISPLAYING SEARCH RESULTS----------->

//2.4-->load the searchResults and store it in model.state
export const loadSearchResults = async function(query)//controller gets input from inputField and call this function
{
  try
  {
    if(!query)//if query is empty then throw error
    {
      throw new Error(`Enter some recipe name`);
    }

    //first clear previous query results in state.searchResults
    state.searchResults.query='';
    state.searchResults.results = [];
    state.searchResults.totalResults = 0;

    //then start the process.
    const jsonFormat = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    //1.storing query in state.searchResults
    state.searchResults.query = query;

    //2.storing all search results(recipes) in results[] of state.searchResults 
    //we want new array of recipes with Updated property names(just like renameRecipeDetails())
    state.searchResults.results = jsonFormat.data.recipes.map((recipe)=>
    {
      return {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      image: recipe.image_url,
      ...(recipe.key && {key:recipe.key}),
    }
    });//changing property names as per our convenience.

    //when results are loaded,then currentPageNumber should become 1.
    state.searchResults.currentPageNumber = 1;

    //3.storing total Number of search results(recipes) in state.searchResults.totalResults  
    state.searchResults.totalResults = jsonFormat.results;
    state.searchResults.totalPages = Math.ceil(state.searchResults.totalResults/RES_PER_PAGE);

    if(state.searchResults.totalResults === 0)
    {
      throw new Error(`We couldnt find that Recipe.Try someother one`);
    }
  }
  catch(error)
  {
    throw error;//MODEL-->CONTROLLER--->display in VIEW
  }
}

//2.6-->to get data(array) of only currentPage(10 recipes)
export const currentPageSearchResults = function(page = state.searchResults.currentPageNumber)
{
  const start = (page*state.searchResults.resultsPerPage)-state.searchResults.resultsPerPage;//previous 10 values from (page*10)
  const end = (page*state.searchResults.resultsPerPage);//end is exclusive.
  state.searchResults.currentPageResults = state.searchResults.results.slice(start,end);
  state.searchResults.currentPageNumber = page;//dont forget to update this
}


//<-------------------------CODE RELATED TO UPDATING THE RECIPE SERVINGS BY USER-------------------------->

//4.1-->to update the recipe servings in state.
export const updateServings = function(newServings)
{
  //new quantity = (oldquantity/old servings) * newServings;
  state.recipe.ingredients.forEach((ing)=>{
    ing.quantity = (ing.quantity/state.recipe.servings) * newServings;//here state.recipe.servings is old servings
  }) 
  
  state.recipe.servings = newServings;//here we have updated to new servings
}


//<-------------------------CODE RELATED TO BOOKMARKING THE RECIPE BY USER-------------------------->

//5.1-->toggle status of bookmark inside state.
export const toggleBookmarkStatus = function(status)
{
  state.recipe.isBookmarked = !status;
}

export const updateBookmarksArray = async function(status)
{
  //update array
  if(status)//true means user is wishing to push(to bookmark)
  {
    state.bookmarks.push(state.recipe);
  }
  else//willing to remove
  {
    state.bookmarks = state.bookmarks.filter((recipe)=> {
      return recipe.id !== state.recipe.id;//if not equal then that recipe is included in new array created by filter()
      //if equal then ignored.(thats what we want)
    });

    /*find index using findIndex() and then splice(index,1)*/
  }
  
  updateLocalStorage();//call this,bookmark added or removed.
}

export const updateLocalStorage = function()
{
  //store updated array in local storage
  localStorage.setItem('bookmarks',JSON.stringify(state.bookmarks));
}

export const getLocalStorage = function()
{
  const storedData = localStorage.getItem('bookmarks');
  const parsedData = storedData ? JSON.parse(storedData) : []; // If storedData is undefined, parsedData will be set to an empty array
  return parsedData;
}

export const clearBMs = function()
{
  localStorage.clear('bookmarks');
}


//<--------------------------------------CODE RELATED TO ADDING RECIPE BUTTON---------------------------------------------->

//6.2-->upload the new Recipe data
export const uploadRecipe = async function(newRecipe)
{
  // 6.1.1-->storing ingredients in array
  let ingredientsArray = [];
  try
  {
    ingredientsArray = Object.entries(newRecipe).filter((entry)=>{
      return entry[0].startsWith('ingredient') && entry[1] !== '';
    }).map((ing)=>{

      const ingArray = ing[1].split(',').map((el)=>{
        return el.trim();
      });

      if(ingArray.length!==3) throw new Error(`wrong ingredient format,please use correct format`);

      const [quantity,unit,description] = ingArray;
      return {quantity:(quantity)?+quantity:null,unit,description};
    })

    //6.1.2-->create object in such a way that it is valid for uploading.
    //we will upload recipe into API,so property names should be as per API's convenience(in renameRecipeDetails() we converted into our convenience)
    const recipeObj = 
    {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients:ingredientsArray,
      isBookmarked:false,//default
    }

    const data = await AJAX(`${API_URL}?key=${API_KEY}`,recipeObj);
    const recipe = data.data.recipe;

    //API returns back details of recipe which we have sent,now convert properties as per our convenience so that we can display in RHS.
    renameRecipeDetails(recipe);//but in this case bookmark will be false as per my logic(thats what we want to call controlBookmark() of controller).
  }
  catch(error)
  {
    throw error;
  }
}
