## Foodmap
Foodmap, powered by Google Maps, aims at enabling users to find restaurants near certain areas and to save them into an exchangeable favorite list. The targeting area can be determined by users' view window or points of interests (POIs) on the map. The editable favorite list can include sublists for users to manage them with respective to locations. Users can also download the favorite list as XML files and upload it later or send it to another user. 

### User Scenarios
What Foodmaps stands out from other web map services can be shown but not limited in the following user scenarios:

    As an user that looks for food, I want to find restaurants near a tourism attraction or a train station within a certain distance, and then save them into a list so that I can look them up later.
    As an user that likes to share my favorite restaurants, I can download the list of restaurant and send it to others.
    As an user that is lazy to look for food, I can upload the list from others and look up the restaurants.

### Implementation
The most fundamental architecture of Foodmap is with reference to a sample search with pagination \cite{1}. The web service \cite{2} allows us to find nearby places plus a filter of types \cite{6}. There are many additional features in Foodmap, some of which have more difficulties in implementation. Here we talk about a few into details.

### Near POIs search within given distance
When the "Show POIs" button is clicked, all the POIs will be visible on the map. and clickable for searching nearby restaurants. Google Maps API allows developers to change the style of maps, including visibility of some POIs \cite{5}. In addition, all the markers are registered with click event \cite{7} to trigger a new search in the new location to realize near POIs search. A message panel appears with the appearance of POIs to hint users to click them. A slider is used for users to give a particular radius for the search.

### Favorite list
As Google Maps API no longer support signed-in feature\cite{10}, Foodmap provides an alternative favorite list that has even more features. There features are implemented purely in Javescript on client side. As users click on any restaurant, it would be put in a temporary list. Then, by clicking save, multiple restaurants are saved into favorite list as a group. Restaurants can be added into favorite lists repetitively as they can belong to multiple groups. The rows of favorite list are clickable for retrieving  restaurant details with another API call \cite{3}. Users can also remove some or all of them from the list later. Functions are mostly implemented in \textit{listtools.js}.

### Download and upload XML file
The favorite list can be downloaded as an XML file. In Javascript, favorite list is an array of objects, which have a name for the area and an array of saved places. Through iteration, Javascript is able to build an XML file from the array \cite{8}. File Saver \cite{11} is utilized to prepare a download on the client side.
Uploading an XML file is easily implemented by Javascript, but parsing the file is even more complicated owing to the nested array structure. For each place, an API request is sent for up-to-date details to be put on the map \cite{3}.

### Discussion
Foodmap realizes most features in Javascript, a programming language that has many unique designs compared to other mainstream languages. For example, the iteration of array or object can be erroneous if developers wrongly use  \textit{of} and \textit{in} in iteration \cite{4}. Another issue is that Javascript is single-threaded while many API calls are asynchronous functions. Developers may access the variables before the return of a function call and therefore retrieve an old value, or even worse, \textit{undefined}, even though the line of code follows the asynchronous function call. A solution is \textit{callback} \cite{9}, but owing to the design of Google Maps APIs, it is found that some cases are not avoidable and a design without such a variable dependency is required.

### Limitation of Google Maps API and strategies for them
Place search with Google Maps returns only 20 entries for every query, along with pagination that allows another 20 entries to be loaded. These 20 entries are of certain types given in the arguments. However, many places may be related to types. For example, a hotel that has a restaurant within are labeled both 'lodging' and 'restaurant.' Though it is not incorrect to list these hotels in the restaurants, they are usually unwanted for users that need just food. In Foodmap, these places are filtered out, but in some unfortunate cases most of the 20 entries are all hotels and very few or even none of restaurants are shown. To compensate this issue, pagination is triggered automatically to load more restaurants when there are fewer than 5 filtered results.
   
Another limitation is the frequencies of geocoding request \cite{12}. Even for licensed developers, there can be maximally 50 requests per seconds. In most of the cases, this limit is breached because of the above-mentioned 20-entries limit. However, there are cases that users may reach that maximum. First, users may repeatedly trigger search. This is avoided in Foodmap by pausing the search button for 5 seconds after each search. Second, the introduced auto-pagination mechanism may repeatedly send requests until at least 5 non-lodging results are accumulated. Third, loading a list from XML file that contains more than 50 places will result in the same number of Geocoding requests. The later two cases are unfortunately not preventable in Foodmap.

### Future Work
There are still many unimplemented features in the design of Foodmap. Here are some example.

    A login system for users to create their profiles and manage the favorite list
    A database that stores user's favorite lists and that loads them after login-in.
    A viewable library of favorite lists which users publicize to others.
    Workaround for the request limitation of Google Maps API, such as sending requests in multiple stages. 

### References
    \bibitem{1} 
    Sample – Place Search Pagination,
    {developers.google.com/maps/documentation/javascript/examples/place-search-pagination}
    \bibitem{2} 
    Places API Web Service,
    {developers.google.com/places/web-service/search}
    \bibitem{3} 
    Place Detail Request,
    {developers.google.com/maps/documentation/javascript/places\#place\_details\_requests}
    \bibitem{4} 
    Javascript – iterators,
    http://}{stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript}
    \bibitem{5} 
    Map Styling,
    {developers.google.com/maps/documentation/javascript/styling}
    \bibitem{6} 
    Types in Search,
    {developers.google.com/places/supported\_types}
    \bibitem{7} 
    POI click events,
    {developers.google.com/maps/documentation/javascript/examples/event-poi}
    \bibitem{8} 
    DOM createElementNS,
    {developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS}
    \bibitem{9} 
    Asynchronous Callback Function,
    {stackoverflow.com/questions/6847697/how-to-return-value-from-an-asynchronous-callback-function}
    \bibitem{10} 
    Google Maps Signed In,
    {developers.google.com/maps/documentation/javascript/signedin}
    \bibitem{11} 
    File Saver,
    {github.com/eligrey/FileSaver.js/}
    \bibitem{12} 
    Google Geocoding API Usage Limits,
    {https://developers.google.com/maps/documentation/geocoding/usage-limits}