/**
 * author: Vivian Ma <vivianma83@gmail.com>
 * Used for UI to generate tutorial
 * refer: https://github.com/kamranahmedse/driver.js?files=1
 */
// used in AMD
if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
  define("ssi-generate-tutorial", ["driver.js","fuse.js","jquery"], function (Driver,Fuse,$) {

    //driverForSteps: Used for multiple steps highlight.
    var driverForSteps  = new Driver({opacity: 0.5, allowClose: false});

    //driverForSingleElement: Used for single element highlight. Highlight with popover or no popover.
    var driverForSingleElement = new Driver({opacity: 0.5});




    /*
     * For highlight multiple steps
     * @param stepsDef: array with multiple element object, the steps elements at different page.
     *[
      {
        element: '.authorizeBtn',
        popover: {
          title: 'myAccounts',
          description: 'myAccounts for xxxxxxx',
          position: 'right'
        }
      },
      {
        element:'.step-authorization-account .b5',
        popover: {
          title:'confirm authorize account',
          position: 'bottom'
        }
      }
    ];
     *
     */
    async function highlightWithAnsyncSteps(stepsDef){
      let currentSeps = 0;
      let driver =  new Driver({
        opacity: 0.5,
        allowClose: true});
      let counter = stepsDef.length;

      if(Array.isArray(stepsDef)){
        currentSeps = getCurrentStepIndexAccordingCurrentPage(stepsDef);
        excuteStep(currentSeps,stepsDef,driver)
      }else{
        console.warn("please pass the correct array type highlight element.");
        return;
      }

      async function excuteStep(currentStepIndex,stepsDef,driverInstnce) {

        if(currentStepIndex===counter){
          return;
        }
        if(!stepsDef[currentStepIndex] || !stepsDef[currentStepIndex].element){
          console.warn('Can not find element at ' + currentStepIndex);
          return;
        }

        let elem = await getWebElement(stepsDef[currentStepIndex].element);


        if(elem){
          driverInstnce.defineSteps([stepsDef[currentStepIndex]]);
          driverInstnce.start();
          elem.one('click',function(){
            setTimeout(()=>{
              driverInstnce.reset(true);
              currentStepIndex++;
              excuteStep(currentStepIndex,stepsDef,driverInstnce);
            },100);

          });
        }else{
          console.warn('Can not find element '+ stepsDef[currentStepIndex].element);
        }
      }


      function getWebElement(ele) {
        var selector = ele;

        return new Promise(function (resolve, reject) {

          var maxTry = 15;

          function _findTree() {
            setTimeout(function () {
              var $tree = $(selector);
              if (!$tree.is(':visible') && maxTry--) {
                _findTree()
              } else if ($tree.is(':visible') && maxTry) {
                resolve($tree)
              } else {
                reject(null)
              }
            }, 300);
          };
          _findTree();

        })

      }


      /***
       * Get element step index which is visible in current page
       * @param stepsDef
       * @returns {number|*}
       */

      function getCurrentStepIndexAccordingCurrentPage(stepsDef) {
        let findElements = stepsDef.filter(function(step) {
          return $(step.element).is(':visible');
        });

        return stepsDef.lastIndexOf(findElements[findElements.length - 1])
      }
    }



    var tutorialGenerator = {
      highlightWithAnsyncSteps:highlightWithAnsyncSteps
    };

    return tutorialGenerator;
  })
}
