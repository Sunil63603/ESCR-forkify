import * as helper from '../helper.js'; //because i have written one function of this file in helper.js(recipeListHTML())
import ParentView from './ParentView.js';

class previewView extends ParentView
{
  //for previewView parent Element is not specific
  _parentElement = '';//is this actual parent element?yes
  //no parent element so operation on parentElement(this._parentElement) should not happen.

  _generateMarkUp()
  {
    //build HTML for each and every recipe.
    return helper.recipeListHTML(this._data);
  }
}

export default new previewView();