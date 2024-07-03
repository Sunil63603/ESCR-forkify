import importedIcons from '../../img/icons.svg'; //used for spinner and error/success message

//export entire class not instance,bcoz we will use this Parent class in many child classes.
export default class ParentView
{
  _data;

  /**
   * Render the received Object to the DOM. 
   * @param {Object | Object[]} data The data to be rendered(e.g recipe) 
   * @param {boolean} {render=true} if false,create markup string,dont display on screen ,just return the markup.render  
   * @returns {undefined|string} A markup string is returned if the render=false.
   * @this {Object} ParentView instance
   * @author Jonas Schmedtmann
   * @todo Finish implementation
   */

  render(data,render = true) 
  {
    this._data = data;

    //1.4-->create HTML variable using details of recipe in case of recipeView
    //2.6-->create HTML variable using recipes array in case of resultsView
    const markup = this._generateMarkUp();

    if(!render)//false
    {
      return markup;//bcoz no parent element to insert the HTML
    }

    this._clear(); //this is to remove spinner

    //for previewView theres no parent
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _clear() {
    this._parentElement.innerHTML = ''; //used to remove message and also to remove spinner
  }

  update(data)
  {
    this._data = data;
    const newMarkup = this._generateMarkUp();//generateMarkUp() is called twice but with two different datas

    //newMarkup is not directly rendered on page.
    //newMarkup is first compared to old markup then changes are updated.
    //newMarkup is a string.first its converted to DOM object(which lives in memory) and we can then use to compare that with actual DOM on page.

    //newDOM is virtual DOM
    const newDOM = document.createRange().createContextualFragment(newMarkup);//string to DOM

    const curElements = Array.from(this._parentElement.querySelectorAll('*'));//selects all elements of old DOM
    const newElements = Array.from(newDOM.querySelectorAll('*'));//selects all elements of new DOM


    //sometimes curELs number is less than newElements then this forEach() gives error
    newElements.forEach((newEl,i)=>{
      const curEl = curElements[i];
      //check is curEL actually exists.
      if(!newEl.isEqualNode(curEl) && curEl)//true means both are same,false means diff,so update which returned false.
      {
        curEl.innerHTML = newEl.innerHTML;
      }
    })
  }


  //1.1-->SPINNER CODE
  startSpinner() {
    //we will use this function in both LHS and RHS part.
    const spinner = `<div class="spinner">
                         <svg>
                           <use href="${importedIcons}#icon-loader"></use>
                         </svg>
                       </div>`;

    this._clear(); //this is to remove message
    this._parentElement.insertAdjacentHTML('afterbegin', spinner);
  }


  //1.5-->guard function to handle invalid recipeID
  stopSpinner() {
    this._clear(); //this is to remove spinner
  }

  //1.6-->displaying error for users from VIEW file
  displayError(message = this._errorMessage) {
    const errorMarkup = `<div class="error">
              <div>
                <svg>
                  <use href="${importedIcons}#icon-alert-triangle"></use>
                </svg>
              </div>
             <p>${message}</p>
         </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', errorMarkup);
  }

  // 1.7-->render success message(when will we use this???????????????????)
  displaySuccessMessage(message = this._successMessage) {
    const errorMarkup = `<div class="error">
              <div>
                <svg>
                  <use href="${importedIcons}#icon-smile"></use>
                </svg>
              </div>
             <p>${message}</p>
         </div>`;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', errorMarkup);
  }
}

