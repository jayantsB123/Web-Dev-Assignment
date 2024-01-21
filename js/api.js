"use strict";

export async function fetchData(url, successCallback, errorCallback) {
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    successCallback(data);
  } else {
    const error = await response.json();
    errorCallback && errorCallback(error);
  }
}

export function getAllRepoData(githubUsername, successCallback, errorCallback) {
  const pagesToFetch = 5;
  let currentPage = 1; // Initialize the current page
  const perPage = 100;
  let allData = []; // Variable to store all retrieved data

  // Recursive function to handle pagination
  function fetchPages(pagesRemaining) {
    const pagesToFetchNow = Math.min(pagesRemaining, pagesToFetch);

    if (pagesToFetchNow <= 0) {
      successCallback(allData); // All data fetched, call success callback
      return;
    }

    const url = `https://api.github.com/users/${githubUsername}/repos?page=${currentPage}&per_page=${perPage}`;

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data, textStatus, xhr) {
        // Check if there are more pages
        const linkHeader = xhr.getResponseHeader('Link');
        const hasNextPage = linkHeader && linkHeader.includes('rel="next"');

        // Concatenate the current page's data to the overall data
        allData = allData.concat(data);

        // If there is a next page, fetch it recursively
        if (hasNextPage) {
          currentPage++;
          fetchPages(pagesRemaining - 1);
        } else {
          // If no more pages, call the success callback with the final data
          successCallback(allData);
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        const error = xhr.responseJSON || { message: textStatus || errorThrown };
        errorCallback && errorCallback(error);
      }
    });
  }

  // Start fetching the first set of pages
  fetchPages(pagesToFetch);
}
