//to get the query and listen to click event(at the top).

class SearchView
{
  #parentElement = document.querySelector('.search');
  
  //0.1-->to add eventListener to the search button
  searchViewListener(handler)
  {
    this.#parentElement.addEventListener('submit',function(e)
    {
      e.preventDefault();
      handler();//calling controlSearchResults.
    });//cannot directly call function 2.
  }

  //2.1-->to get query from inputField
  getQuery()
  {
    const query =  this.#parentElement.querySelector('.search__field').value;
    this.#clearInputField();

    return query;
  }

  #clearInputField()
  {
    this.#parentElement.querySelector('.search__field').value = '';
  }
}

export default new SearchView();