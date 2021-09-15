var timer_obj;
var timer_dict={};
var todo_tasks =[];

//timer tracker is the name of my base class
class TimeTracker{
    constructor(){
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.displaySeconds = 0;
        this.displayMinutes = 0;
        this.displayHours = 0;
        this.interval = null;
        this.status = "stopped";
        this.input = '';
        this.category = 0;
        this.date='';        
    }
    //registers the sart/pause/stop events
    registerActions(){
        this.registerStart();
        this.registerPause();
        this.registerStop();
    }
   //setting of setVariables
    setVariables() {
        this.input = $('#input').val();
        this.category = $('#select option:selected').val();
        this.date = $('#tododate').val();
    }
    //starts the time
    registerStart(){
        var self = this;
        jQuery('.container').on("click", "#start", function() {
            self.setVariables();
            self.status = "started";
            self.interval = window.setInterval(function(){ self.RunTimer();}.bind(self), 1000);
            self.toggleElements('start');
        });
    }
    //pauses the time
    registerPause(){
        var self = this;
        jQuery('.container').on("click", "#pause",function() {
            self.setVariables();
            self.status = "started";
            window.clearInterval(self.interval);
            self.toggleElements('pause');
        });
    }
    //stops it and returns the output
    registerStop(){
        var self = this;
        jQuery('.container').on("click", "#stop", function(){
             localStorage.removeItem("timer");
        $('#input').prop( "disabled", false);
        let time = self.displayHours + `:` + self.displayMinutes + `:` + self.displaySeconds;
        if(self.date == $('#tododate').val()){
           
            self.PrintInTable(self.input, self.category, time);
        }
        else{
            $('#tododate').val(self.date);
            self.PrintInTable(self.input, self.category, time);
        }
        window.clearInterval(self.interval);
        self.seconds = 0;
        self.minutes = 0;
        self.hours = 0;
        $('#starterClock').hide();
        var task_dict={};
        task_dict['date'] = self.date;
        task_dict['input'] = self.input;
        task_dict['category'] = self.category;
        task_dict['time'] = self.displayHours + `:` + self.displayMinutes + `:` + self.displaySeconds;
        todo_tasks.push(task_dict);
        localStorage.setItem("todo", JSON.stringify(todo_tasks));
        task_dict={}
        window.clearInterval(self.interval);
        $('#input').val('');
        $('#starterClock').html("00:00:00");
            self.toggleElements('stop');
        });
    }
       /**
     * 1) On start - we should show pause, stop actions and hide start button
     * 2) On Pause - we should show start, stop actions and hide pause button
     * 3) On Stop - we should hide all timer actions
     * 4) table - to print the table when ever necessary
     */
    toggleElements(action) {
        switch(action) {
            case 'start' :
                $('#pause').show();
                $('#stop').show();
                $('#start').hide();
                break;
            case 'pause':
                $('#start').show();
                $('#stop').show();
                $('#pause').hide();
                break;    
            case 'stop':
                $('#stop').hide();
                $('#pause').hide();
                $('#start').hide();
                $('#table').show();
                break;
            case 'table':
                $('#table').show();
        }
    }
    //Starting the timer
    RunTimer(){
        if (localStorage.timer) {
            var timer = JSON.parse(localStorage.getItem("timer"));
            this.input = timer['current_task']
            this.category = timer['category']
            this.hours = parseInt(timer['hour'])
            this.minutes = parseInt(timer['minutes'])
            this.seconds = parseInt(timer['seconds'])
        }else{
            this.displaySeconds = 0;
            this.displayMinutes = 0;
            this.displayHours = 0;
        }
        this.seconds++;
        if (this.seconds / 60 === 1) {
            this.seconds = 0;
            this.minutes++;
           
            if (this.minutes / 60 === 1) {
                this.minutes = 0;
                this.hours++;
            }
        }
        if (this.seconds < 10) {
            this.displaySeconds = "0" + this.seconds.toString();
        }
        else {
            this.displaySeconds = this.seconds;
        }
       
        if (this.minutes < 10) {
            this.displayMinutes = "0" + this.minutes.toString();
        }
        else {
            this.displayMinutes = this.minutes;
        }
       
        if (this.hours < 10) {
            this.displayHours = "0" + this.hours.toString();
        }
        else {
            this.displayHours = this.hours;
        }
        $('#input').val(this.input);
        $('#select option:selected').val(this.category);
            timer_dict={
                'current_task':this.input,
                'category':this.category,
                'hour':this.displayHours,
                'minutes':this.displayMinutes,
                'seconds':this.displaySeconds
            }
        localStorage.setItem("timer", JSON.stringify(timer_dict));
        timer_dict={}
        $('#starterClock').html(this.displayHours + ":" + this.displayMinutes + ":" + this.displaySeconds);
    }
    //for printing the data inthe form of a table
    PrintInTable(input, category, time){
        var row = `<tr>
        <td class = 'td'>  ` + input + `</td>
        <td class = 'td'> ` + category + `</td>'
        <td class = 'td'> `+ time + `</td>
        </tr>`;
       
        $('.table tbody').append(row);   
    }
    //displaying the tasks according to the date using local storage
    DisplayTasks(date){
        var count=0;
        if (typeof(Storage) !== "undefined") {
            if (localStorage.todo) {
                let ltasks = JSON.parse(localStorage.getItem("todo"));
                todo_tasks=ltasks.slice();
                if(todo_tasks.length != 0){
                    $('.table tbody').find("tr:gt(0)").remove();
                    for(let i=0;i<todo_tasks.length;i++){
                        if(todo_tasks[i].date == date){
                            count+=1
                            $(document).ready(function () {
                                let addprevtask_obj = new TimeTracker();
                                addprevtask_obj.PrintInTable(todo_tasks[i].input, todo_tasks[i].category, todo_tasks[i].time);
                            });
                        }
                    }
                   
                    if(count==0){
                        this.toggleElements('table');
                    }
            else
            {
                this.toggleElements('table');             
                localStorage.setItem("todo", JSON.stringify(todo_tasks));
                let ltasks = JSON.parse(localStorage.getItem("todo"));
                todo_tasks=ltasks.slice();
            }
        }
    }
}
}    // datepicker picks the current day's date and displays its tasks
    registerElementsUI() {
        $("#tododate").datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function(date) {  
                timer_obj.DisplayTasks(date);
            }  
        })
    }//registers the  timer block on the screen /html
    registerTimerBlock(){
        let TodayDate = (new Date()).toISOString().split('T')[0];
    $('#tododate').val(TodayDate);
    this.toggleElements('stop');
    $('#starterClock').hide();
    timer_obj = new TimeTracker();
    timer_obj.DisplayTasks(TodayDate);
      if (localStorage.timer) {
        $('#input').prop( "disabled", true );
        this.setVariables();     
           if (this.status === "stopped"){
                this.interval = window.setInterval(function(){ this.RunTimer();}.bind(this), 1000);
                this.status = "started";
            }      
          this.toggleElements('start');
         $('#starterClock').show(); 
     }
     else{
        $('#text').keypress(function (event) {
            if (event.which == 13) {
                $('#start').show();
                $('#starterClock').show();
            }
        });        
     }
        this.registerActions();
    }
    //registers these basic events 
    registerEvents() {
        this.registerTimerBlock();
        this.registerElementsUI();
    }  
}
//DOM onload ---- on opening of the file it loads all these elements(page on load)
$(document).ready(function() {
    var timeTracker = new TimeTracker();
    timeTracker.registerEvents();
});