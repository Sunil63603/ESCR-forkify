import ParentView from '../views/ParentView.js';//importing code from parent class to child class
//basically to reuse code inside ParentView class

import previewView from './previewView.js';

import * as helper from '../helper.js'; //because i have written one function of this file in helper.js(recipeListHTML())

class bookmarkView extends ParentView
{
  //for LHS parent Element is 'results' container.
  _parentElement = document.querySelector('.bookmarks__list');//is this actual parent element?yes
  _errorMessage = `No bookmarks yet. Find a nice recipe and bookmark it :)`;

  //0.6-->when page loads,render bookmarks
  addHandlerRender(handler)
  {
    window.addEventListener('load',handler);
  }

  _generateMarkUp()
  {
    if(this._data.length !== 0)//if there are bookmarked recipes in array
    return previewView.render(this._data,false);//it should not try to insert HTML,just create markup and return
    //if there are no bookmarked recipes
    else
    {
      return helper.friendlyBmMessage();
    }
  }
}

export default new bookmarkView();
//update parentElement,clear and call methods of ParentView(error/start spinner/stop spinner)