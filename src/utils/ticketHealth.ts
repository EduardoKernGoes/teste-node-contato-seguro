interface ticketHealth {
    createdAt: Date | string;
    priority: string;
}

export function calculateTicketHealth(ticket: ticketHealth): string{
    let creationDate = new Date(ticket.createdAt)
    let now = new Date()
    let hourPassed = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60)

    if(ticket.priority === 'HIGH' && hourPassed > 24){
        return 'CRITICAL'
    } else if(ticket.priority === 'HIGH' || hourPassed > 12){
        return 'ALERT'
    } else {
        return 'HEALTHY'
    }
}