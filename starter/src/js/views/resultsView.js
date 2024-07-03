import ParentView from '../views/ParentView.js';//importing code from parent class to child class
//basically to reuse code inside ParentView class

import previewView from './previewView.js';

import * as helper from '../helper.js'; //because i have written one function of this file in helper.js(recipeListHTML())

class resultsView extends ParentView
{
  //for LHS parent Element is 'results' container.
  _parentElement = document.querySelector('.results');//is this actual parent element?yes
  _errorMessage = `Sorry we could find any recipes/try some other one`;
  _successMessage = `here is the recipe list which you are searching for`;
  
  //2.2-->tell user to enter some recipe name by displaying error message(directly call displayError() inside ParentView in Controller using instance of this resultsView class)

  //2.3-->start spinner while displaying recipes in LHS  

  //2.5-->stop Spinner after loading recipes in LHS

  //2.6-->to display result recipes in LHS
  _generateMarkUp()
  {
    return previewView.render(this._data,false);//it should not try to insert HTML,just create markup and return
  }
}

export default new resultsView();
//update parentElement,clear and call methods of ParentView(error/start spinner/stop spinner)