//to ensure most range of browsers are compatible.
import 'core-js/stable'; //is for polyfill async await
import 'regenerator-runtime/runtime'; //to polyfill everything else.

//importing model(state,loadRecipe()) from model.js (to update the View part/to display recipe)
import * as model from '../js/model.js';//to get state and to load recipes asynchronously 
import recipeView from './views/recipeView.js';//to display DOM changes. 
import searchView from './views/searchView.js';//to get query and listen to `click` event. 
import resultsView from './views/resultsView.js';//to display results in LHS and to use methods 
import pageView from './views/paginationView.js';//to display page buttons. 
import bookmarkView from './views/bookmarkView.js';//to display bookmarked recipes.
import addRecipeView from './views/addRecipeView.js';//to show and hide addRecipe window.
import * as config from './config.js';//for MODAL_CLOSE_SEC global variable


//<-----------------------------------JS CODE------------------------------------------------->
// code will be replaced without full page reload
if (module.hot) {
  module.hot.accept();
}


//A.Displaying recipe in RHS
//B.Loading Search Results
//C.Update recipe Info based on number of servings
//D.CODE RELATED TO BOOKMARKING
//E.CODE RELATED TO ADDING RECIPE BUTTON


//<---- A.START OF CODE RELATED TO DISPLAYING RECIPE ON RHS---->

//0-->Events must be listened in VIEW and must be handled in CONTROLLER
init();

function init()
{
  searchView.searchViewListener(controlSearchResults);//0.1-->to add eventListener to the search button
  recipeView.recipeViewListener(controlRecipes);//0.2-->to add event listener to the search results(ResultsView)and display particular recipe in RHS
  recipeView.servingsUpdateListener(controlServings);//0.3-->to listen when number of servings are updated.
  recipeView.addBookmarkListener(controlBookmark);//0.4-->to listen click event whenever user clicks on bookmark button 
  pageView.pageBtnClickListener(controlPagination);//0.5-->to listen either previous page/next page button was clicked
  bookmarkView.addHandlerRender(controlRenderBMs);//0.6-->when page loads,render bookmarks
  addRecipeView.addHandlerUpload(controlAddRecipe);//0.7-->when user uploads recipe,receive data into controller--then to-->MODEL
}

//1-->Spinner till load,get ID,then load and display recipe details in '.recipe' division(RHS part)
async function controlRecipes() {
  try {
    // guard clause
    if (!window.location.hash) return;

    //1.1-->SPINNER while recipe is yet to load.(RECIPEVIEW)
    recipeView.startSpinner();

    //1.2-->now get the recipe ID which is present in URL bar.(CONTROLLER)
    let recipeID = await getRecipeID();


    //to indicate selected recipe(make it active),we need to update resultsView.
    resultsView.update(model.state.searchResults.currentPageResults);

    //to update the active recipe in bookmarks button
    bookmarkView.update(model.state.bookmarks);
    
    //1.3-->loading the recipe(asynchronous recipe fetching)(MODEL)
    await model.loadRecipe(recipeID);
    let { recipe:recipeDetails } = model.state;

    //1.4-->after loading recipe details now display recipe on RHS(in .recipe div)(RECIPEVIEW)
    recipeView.render(recipeDetails);//you can also pass model.state.recipe
  } catch (error) {
    console.log(error);
    //1.5-->to stop spinner when we have encountered any error.
    recipeView.stopSpinner();//(RECIPEVIEW)
    
    //1.6-->displaying error for users from VIEW file
    recipeView.displayError();//(RECIPEVIEW)
  }
  
}

//1.2-->get recipe ID from URL bar.
async function getRecipeID()//(CONTROLLER) 
{
  //we can get it from URL bar
  let recipeHash = window.location.hash;
  return recipeHash.substring(1); //remove hash we only need number.
}

//<-------------END OF A)DISPLAYING RECIPE IN RHS PART------------------>


//<------------B.CODE RELATED TO LOADING AND DISPLAYING SEARCH RESULTS IN LHS----------->


// 2-->load and display search results in LHS.
async function controlSearchResults()
{
  try
  {
    //2.1-->get query from inputField
    const query = searchView.getQuery();//(SEARCHVIEW)
    
    //2.2-->tell user to enter some recipe name by displaying error message(RESULTSVIEW)
    //handled this error in model.js while loading search results
    
    //2.3-->start spinner while displaying recipes in LHS(RESULTSVIEW)
    resultsView.startSpinner();
    
    //2.4-->load the searchResults and store it in model.state
    await model.loadSearchResults(query);//(SEARCHVIEW)
    
    //2.5-->stopSpinner after loading recipes in LHS(RESULTSVIEW) should i stop this after displaying the recipes in LHS.
    resultsView.stopSpinner();
    
    const totalRecipes = model.state.searchResults.totalResults;//if totalRecipes = 0,then that error is handled in model.js
    const totalPages = model.state.searchResults.totalPages;
    //displaySuccessMessage and display results on LHS
    recipeView.displaySuccessMessage(`Found ${totalRecipes} search results for this recipe which are displayed using ${totalPages} pages`);
    
    //This is for default page/first page.
    model.currentPageSearchResults();

    //2.6-->to display current page results in LHS(RECIPEVIEW)
    resultsView.render(model.state.searchResults.currentPageResults);

    //2.7-->to display page buttons for currentPage.(PaginationVIEW)
    pageView.render(model.state.searchResults.currentPageNumber);//1 is default as soon as results load
  }
  catch(error)
  {
    console.log(error);
    //when query is empty,or no results found for query
    resultsView.displayError(error);
    recipeView.displayError(error);

    // 2.8-->to clear buttons when error occurs
    pageView.handleError();
  }
}

//3-->to handle whenever pageButtons are clicked
function controlPagination(goToPage)
{
  model.state.searchResults.currentPageNumber = goToPage;
  model.currentPageSearchResults();

  //2.6-->to display current page results in LHS(RECIPEVIEW)
  resultsView.render(model.state.searchResults.currentPageResults);

  //2.7-->to display page buttons for currentPage.(PaginationVIEW)
  pageView.render(model.state.searchResults.currentPageNumber);
}

//<------------END OF B)LOADING AND DISPLAYING SEARCH RESULTS IN LHS----------->

//<-----------------c)Update recipe Information based on number of servings dynamically--------->

//4-->handler function when number of servings in updates dynamically 
function controlServings(newServings)
{
  //4.1-->to update the recipe servings in state.
  model.updateServings(newServings);

  //4.2-->update the recipe View with newServings
  let { recipe:recipeDetails } = model.state;
  recipeView.update(recipeDetails);

  /*
  this is not so efficient bcoz entire recipe container is updated
  recipeView.render(recipeDetails);
  we were able to use the same function,only because we have update newServings in state.
  */
}

//<-------------------------------------------D)CODE RELATED TO BOOKMARKING---------------------------------------------->

// 5-->handler to add/remove a bookmark whenever user clicks on bookmark icon
function controlBookmark()
{
  const curRecipe = model.state.recipe;

  //change status,change icon,update bookmarks[],update local storage

  //5.1-->change status
  model.toggleBookmarkStatus(curRecipe.isBookmarked);//MODEL
  
  //5.2-->change icon
  recipeView.update(curRecipe);
  
  //5.3-->update array
  model.updateBookmarksArray(curRecipe.isBookmarked);//MODEL
  
  //5.4-->display in bookmark button
  bookmarkView.render(model.state.bookmarks);
}

function controlRenderBMs()
{
  let bookmarksArray = model.getLocalStorage();
  model.state.bookmarks = bookmarksArray;
  bookmarkView.render(model.state.bookmarks);
}



//<--------------------------------------E)CODE RELATED TO ADDING RECIPE BUTTON---------------------------------------------->

//6-->to handle whenever user submits recipe
async function controlAddRecipe(newRecipe)
{
  try
  {
    //6.1-->show loading spinner while uploading
    addRecipeView.startSpinner();

    //6.2-->upload the new Recipe data
    await model.uploadRecipe(newRecipe);

    //6.2-->to display user added recipe in RHS
    recipeView.render(model.state.recipe);

    //6.3-->change #hashcode in url bar at the top
    window.history.pushState(null,'',`#${model.state.recipe.id}`);

    //6.4-->user added recipe are bookmarked. 
    controlBookmark();

    //6.5-->display suceess message once recipe has been successfully uploaded.
    addRecipeView.displaySuccessMessage();

    //6.6-->close the form
    setTimeout(function()
    {
      addRecipeView.toggleWindow();
    },config.MODAL_CLOSE_SEC * 1000);
  }
  catch(error)
  {
    console.error(error.message);
    addRecipeView.displayError(error.message);//where is the error getting displayed.
  }
}


