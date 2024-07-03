import ParentView from '../views/ParentView.js';//importing code from parent class to child class

import importedIcons from '../../img/icons.svg'; //used for spinner and error/success message
import * as helper from '../helper.js'; //because i have written many functions of this file in helper.js

class RecipeView extends ParentView
{
  _parentElement = document.querySelector('.recipe'); //recipeContainer will be the _parentElement for recipe in RHS
  _errorMessage = `we couldnt find that recipe.please try another one`;
  _successMessage = `here is the recipe list which you are searching for`;
  
  
  //0.2-->to add event listener to the search results (which are in LHS)
  //Events must be listened in VIEW and must be handled in CONTROLLER
  recipeViewListener(
    handler //handler is function which must be called to handle the event.
  ) {
    //why do we add Event Listener to the window?
    ['hashchange', 'load'].forEach(ev => {
      window.addEventListener(ev, handler); //calling function 1
    });
  }

  //0.3-->to listen when user wants to update the number of servings dynamically
  servingsUpdateListener(handler)
  {
    this._parentElement.addEventListener('click',function(e)//entire recipeContainer is parentElement
    {
      const btn = e.target.closest('.btn--tiny');//nearest child with this class
      if(!btn) return;//if no button then return

      const newServings = +(btn.dataset.servings);//get newServings value from that

      if(newServings>0)
      handler(newServings);//call the controlServings()
    });
  }


  //0.4-->to listen whenever user clicks and bookmark button and call the handler
  addBookmarkListener(handler)
  {
    this._parentElement.addEventListener('click',function(e)
    {
      const btn = e.target.closest('.btn--bookmark');//understand advantages of event delegation from Parent element when child element is not yet present on web page

      if(!btn) return;
      handler();
    })
  }

  //1.4-->create HTML variable using details of recipe
  _generateMarkUp() {
    return `
        ${helper.imageAndTitle(this._data)}

          <div class="recipe__details">
            ${helper.cookingTime(this._data)}
            ${helper.servings(this._data)}
            ${helper.userGenerated(this._data)}
            ${helper.bookMark(this._data)}
          </div>

          ${helper.recipeIngredients(this._data)}  

          ${helper.recipeDirections(this._data)}
        `;

    //all these functions are written in helper.js
    //1.4.1-->HTML for image and title
    //1.4.2-->HTML for cookingTime
    //1.4.3-->HTML for servings
    //1.4.4-->HTML to indicate recipe is userGenerated or not
    //1.4.5-->HTML for BookMark
    //1.4.6-->HTML for ingredients
    //1.4.7-->HTML for recipeDirections
  } 
}

export default new RecipeView(); //new object is being exported
