import ParentView from '../views/ParentView.js';//importing code from parent class to child class
//basically to reuse code inside ParentView class

class addRecipeView extends ParentView
{
  //for addingRecipeView parent Element is '' container.
  _parentElement = document.querySelector('.upload');//is this actual parent element?
  _successMessage = 'Recipe was successfully uploaded';

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _addRecipeOpen = document.querySelector('.nav__btn--add-recipe');
  _addRecipeClose = document.querySelector('.btn--close-modal');

  constructor()
  {
    super();
    //these functions need not depend on controller so as soon as forkify loads just call these functions.so we are calling it inside constructor()
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  _addHandlerShowWindow()
  {
    this._addRecipeOpen.addEventListener('click',this.toggleWindow.bind(this));
    //'this' inside eventListener will be pointing to the HTML element
  }

  _addHandlerHideWindow()
  {
    [this._overlay,this._addRecipeClose].forEach((closeElement)=>{
      closeElement.addEventListener('click',this.toggleWindow.bind(this))
    });
  }

  addHandlerUpload(handler)
  {
    this._parentElement.addEventListener('submit',function(e)
    { 
      e.preventDefault();
      const dataArray = [...new FormData(this)];//'this' point to HTML element(ie.parentElement or form element)
      const data = Object.fromEntries(dataArray);//converts iterators like array into object with property:value pairs.
      handler(data);
    });
  }


  toggleWindow()
  {
    this._overlay.classList.toggle(`hidden`);
    this._window.classList.toggle(`hidden`);
  }
}

export default new addRecipeView();